using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Conversations.Application.Services.SuggestReplyService;
using SocialOps.Api.Features.Conversations.Application.Services.AnalyzeConversation;
using SocialOps.Api.Features.Conversations.Application.Dtos.SuggestReply;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Application.Services;
using SocialOps.Api.Features.Conversations.Application.GenerateAgentReply;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Tenancy;


namespace SocialOps.Api.Features.Conversations.Controllers;

[ApiController]
[Authorize(Policy = SocialOpsPolicies.TenantReader)]
[Route("api/conversations")]
public sealed class ConversationsController : ControllerBase
{
    private readonly ConversationsService _conversationService;
    private readonly MessageService _messageService;
    private readonly IValidator<CreateConversationRequest> _conversationValidator;
    private readonly IValidator<AddMessageRequest> _messageValidator;
    private readonly AnalyzeConversationService _analyzeService;
    private readonly SuggestReplyService _suggestReplyService;
    private readonly GenerateAgentReplyService _generateAgentReplyService;
    private readonly ITenantContext _tenantContext;

    public ConversationsController(
        ConversationsService createConversationService,
        MessageService messageService,
        IValidator<CreateConversationRequest> conversationValidator,
        IValidator<AddMessageRequest> messageValidator,
        AnalyzeConversationService analyzeService,
        SuggestReplyService suggestReplyService,
        GenerateAgentReplyService generateAgentReplyService,
        ITenantContext tenantContext
        )
    {
        _conversationService = createConversationService;
        _messageService = messageService;
        _conversationValidator = conversationValidator;
        _messageValidator = messageValidator;
        _analyzeService = analyzeService;
        _suggestReplyService = suggestReplyService;
        _generateAgentReplyService = generateAgentReplyService;
        _tenantContext = tenantContext;
    }

    [HttpPost]
    [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
    public async Task<ActionResult<CreateConversationResponse>> Create([FromBody] CreateConversationRequest request, CancellationToken cancellationToken)
    {
        request = request with
        {
            OrganizationId = _tenantContext.RequireOrganizationId()
        };

        var validationResult = await _conversationValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid) return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));

        var response = await _conversationService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPost("{conversationId:guid}/messages")]
    [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
    public async Task<ActionResult<MessageResponse>> AddMessage(Guid conversationId, [FromBody] AddMessageRequest request, CancellationToken cancellationToken)
    {
        var conversation = await RequireConversationAccess(conversationId, cancellationToken);

        if (conversation is null) return NotFound();

        var validationResult = await _messageValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));
        }

        var response = await _messageService.AddAsync(conversationId, request, cancellationToken);

        return Ok(response);
    }

    [HttpPost("{conversationId:guid}/messages/{messageId:guid}/retry")]
    [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
    public async Task<ActionResult<MessageResponse>> RetryMessage(
        Guid conversationId,
        Guid messageId,
        CancellationToken cancellationToken)
    {
        var conversation = await RequireConversationAccess(conversationId, cancellationToken);

        if (conversation is null) return NotFound();

        var response = await _messageService.RetryDeliveryAsync(conversationId, messageId, cancellationToken);

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<GetInboxResponse>>> GetInbox([FromQuery] Guid? organizationId, CancellationToken cancellationToken)
    {
        var tenantOrganizationId = _tenantContext.RequireOrganizationId();

        if (organizationId.HasValue)
        {
            _tenantContext.EnsureOrganization(organizationId.Value);
        }

        var response = await _conversationService.GetAsync(tenantOrganizationId, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GetConversationResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _conversationService.GetByIdAsync(id, cancellationToken);

        if (response is null) return NotFound();

        _tenantContext.EnsureOrganization(response.OrganizationId);

        return Ok(response);
    }

    [HttpPost("{conversationId:guid}/analyze")]
    [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
    public async Task<ActionResult<AnalyzeConversationResponse>> Analyze(Guid conversationId, CancellationToken cancellationToken)
    {
        var conversation = await RequireConversationAccess(conversationId, cancellationToken);

        if (conversation is null) return NotFound();

        var response = await _analyzeService.AnalyzeAsync(conversationId, cancellationToken);

        if (response is null) return NotFound("No inbound message was found for this conversation.");

        return Ok(response);
    }

    [HttpPost("{conversationId:guid}/suggest-reply")]
    [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
    public async Task<ActionResult<SuggestReplyResponse>> SuggestReply(Guid conversationId, CancellationToken cancellationToken)
    {
        var conversation = await RequireConversationAccess(conversationId, cancellationToken);

        if (conversation is null) return NotFound();

        var response = await _suggestReplyService.GenerateAsync(conversationId, cancellationToken);

        if (response is null) return NotFound("Conversation or conversation messages were not found.");

        return Ok(response);
    }

    [HttpPost(
    "{conversationId:guid}/agent-reply")]
    [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
    public async Task<ActionResult<GenerateAgentReplyResponse>> GenerateAgentReply(Guid conversationId, CancellationToken cancellationToken)
    {
        var conversation = await RequireConversationAccess(conversationId, cancellationToken);

        if (conversation is null) return NotFound();

        var response = await _generateAgentReplyService.GenerateAsync(conversationId, cancellationToken);

        if (response is null) return NotFound("Conversation or inbound message was not found.");

        return Ok(response);
    }

    private async Task<GetConversationResponse?> RequireConversationAccess(
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        var conversation = await _conversationService.GetByIdAsync(conversationId, cancellationToken);

        if (conversation is null)
        {
            return null;
        }

        _tenantContext.EnsureOrganization(conversation.OrganizationId);

        return conversation;
    }
}
