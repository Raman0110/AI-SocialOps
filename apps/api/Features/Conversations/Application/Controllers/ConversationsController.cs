using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Application.Services;

namespace SocialOps.Api.Features.Conversations.Controllers;

[ApiController]
[Route("api/conversations")]
public sealed class ConversationsController : ControllerBase
{
    private readonly ConversationsService _conversationService;
    private readonly AddMessageService _addMessageService;
    private readonly IValidator<CreateConversationRequest> _conversationValidator;
    private readonly IValidator<AddMessageRequest> _messageValidator;

    public ConversationsController(
        ConversationsService createConversationService,
        AddMessageService addMessageService,
        IValidator<CreateConversationRequest> conversationValidator,
        IValidator<AddMessageRequest> messageValidator)
    {
        _conversationService = createConversationService;
        _addMessageService = addMessageService;
        _conversationValidator = conversationValidator;
        _messageValidator = messageValidator;
    }

    [HttpPost]
    public async Task<ActionResult<ConversationResponse>> Create([FromBody] CreateConversationRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _conversationValidator.ValidateAsync(
                request,
                cancellationToken);

        if (!validationResult.IsValid)
        {
            return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));
        }

        var response =  await _conversationService.CreateAsync(
                request,
                cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Id },
            response);
    }

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        // Implement next.
        return Ok();
    }

    [HttpPost("{conversationId:guid}/messages")]
    public async Task<ActionResult<MessageResponse>> AddMessage(
        Guid conversationId,
        [FromBody] AddMessageRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _messageValidator.ValidateAsync(
                request,
                cancellationToken);

        if (!validationResult.IsValid)
        {
            return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));
        }

        var response = await _addMessageService.AddAsync(
                conversationId,
                request,
                cancellationToken);

        return Ok(response);
    }
}