using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Features.AgentActions.Application.CreateTicketProposal;
using SocialOps.Api.Features.AgentActions.Application.Services.CreateTicketProposal;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Application.Dtos.GetCustomerContext;
using SocialOps.Api.Features.Conversations.Application.Services;
using SocialOps.Api.Features.Conversations.Application.Services.GetCustomerContext;
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

  public AgentToolsController(GetCustomerContextService customerContextService, GetConversationHistoryService conversationHistoryService, CreateTicketProposalService createTicketProposalService)
  {
    _customerContextService = customerContextService;
    _conversationHistoryService = conversationHistoryService;
    _createTicketProposalService = createTicketProposalService;
  }

  [HttpGet("conversations/{conversationId:guid}/customer-context")]
  public async Task<ActionResult<GetCustomerContextResponse>>
  GetCustomerContext(Guid conversationId, CancellationToken cancellationToken)
  {
    var response = await _customerContextService.GetAsync(conversationId, cancellationToken);

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

    var response = await _conversationHistoryService.GetAsync(conversationId, limit, cancellationToken);

    if (response is null) return NotFound();

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

    var actionId = await _createTicketProposalService.CreateAsync(conversationId, ticketPorposalPayload, cancellationToken);

    if (actionId is null) return NotFound();

    return Ok(new
    {
      actionId,
      status = "Pending",
      requiresApproval = true
    });
  }
}