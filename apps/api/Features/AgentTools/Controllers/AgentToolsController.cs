using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Tenancy;
using SocialOps.Api.Features.AgentActions.Application.CreateTicketProposal;
using SocialOps.Api.Features.AgentActions.Application.Services.CreateTicketProposal;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Application.Dtos.GetCustomerContext;
using SocialOps.Api.Features.Conversations.Application.Services;
using SocialOps.Api.Features.Conversations.Application.Services.GetCustomerContext;
using SocialOps.Api.Features.Knowledge.Application.Dtos;
using SocialOps.Api.Features.Knowledge.Application.Services;
using SocialOps.Api.Features.Tickets.Domain;

namespace SocialOps.Api.Features.AgentTools.Controllers;

[ApiController]
[Authorize(Policy = SocialOpsPolicies.TenantOperator)]
[Route("internal/agent-tools")]
public sealed class AgentToolsController : ControllerBase
{
  private readonly GetCustomerContextService _customerContextService;
  private readonly GetConversationHistoryService _conversationHistoryService;
  private readonly CreateTicketProposalService _createTicketProposalService;
  private readonly KnowledgeService _knowledgeService;
  private readonly ITenantContext _tenantContext;

  public AgentToolsController(GetCustomerContextService customerContextService, GetConversationHistoryService conversationHistoryService, CreateTicketProposalService createTicketProposalService, KnowledgeService knowledgeService, ITenantContext tenantContext)
  {
    _customerContextService = customerContextService;
    _conversationHistoryService = conversationHistoryService;
    _createTicketProposalService = createTicketProposalService;
    _knowledgeService = knowledgeService;
    _tenantContext = tenantContext;
  }

  [HttpGet("conversations/{conversationId:guid}/customer-context")]
  public async Task<ActionResult<GetCustomerContextResponse>>
  GetCustomerContext(Guid conversationId, CancellationToken cancellationToken)
  {
    var response = await _customerContextService.GetAsync(conversationId, _tenantContext.RequireOrganizationId(), cancellationToken);

    if (response is null) return NotFound();

    return Ok(response);
  }

  [HttpGet("conversations/{conversationId:guid}/history")]
  public async Task<ActionResult<GetConversationHistoryResponse>> GetConversationHistory(
        Guid conversationId,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
  {
    if (limit is < 1 or > 50) return BadRequest("Limit must be between 1 and 50.");

    var response = await _conversationHistoryService.GetAsync(conversationId, _tenantContext.RequireOrganizationId(), limit, cancellationToken);

    if (response is null) return NotFound();

    return Ok(response);
  }

  [HttpGet("knowledge/search")]
  public async Task<ActionResult<SearchKnowledgeResponse>> SearchKnowledge(
        [FromQuery] string? query,
        CancellationToken cancellationToken = default)
  {
    if (string.IsNullOrWhiteSpace(query) || query.Length > 500) return BadRequest("Query is required and must be at most 500 characters.");

    var response = await _knowledgeService.SearchAsync(_tenantContext.RequireOrganizationId(), query, cancellationToken);

    return Ok(response);
  }

  public sealed record ProposeTicketRequest(
      string Title,
      string Description,
      TicketPriority Priority
  );

  [HttpPost("conversations/{conversationId:guid}/ticket-proposals")]
  public async Task<ActionResult<object>> ProposeTicket(Guid conversationId, ProposeTicketRequest request, CancellationToken cancellationToken)
  {
    var ticketPorposalPayload = new CreateTicketProposalPayload(request.Title, request.Description, request.Priority);

    var actionId = await _createTicketProposalService.CreateAsync(conversationId, _tenantContext.RequireOrganizationId(), ticketPorposalPayload, cancellationToken);

    if (actionId is null) return NotFound();

    return Ok(new
    {
      actionId,
      status = "Pending",
      requiresApproval = true
    });
  }
}