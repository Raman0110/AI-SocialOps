using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.AgentActions.Application.Dtos;
using SocialOps.Api.Features.AgentActions.Application.GetPendingActions;
using SocialOps.Api.Features.AgentActions.Application.Services.ApproveAgentAction;

namespace SocialOps.Api.Features.AgentActions.Controllers;

[ApiController]
[Route("api/agent-actions")]
public sealed class AgentActionsController : ControllerBase
{
  private readonly AgentActionService _agentActionService;
  private readonly GetPendingAgentActionsService
    _getPendingService;

  public AgentActionsController(AgentActionService agentActionService, GetPendingAgentActionsService getPendingService)
  {
    _agentActionService = agentActionService;
    _getPendingService = getPendingService;
  }

  [HttpPost("{id:guid}/approve")]
  public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
  {
    var ticketId = await _agentActionService.ApproveAsync(id, cancellationToken);

    if (ticketId is null) return NotFound();

    return Ok(new
    {
      ticketId
    });
  }

  [HttpPost("{id:guid}/reject")]
  public async Task<IActionResult> Reject(Guid id, CancellationToken cancellationToken)
  {
    var success = await _agentActionService.RejectAsync(id, cancellationToken);

    if (!success) return NotFound();

    return NoContent();
  }

  [HttpGet]
  public async Task<ActionResult<IReadOnlyList<GetPendingAgentActionResponse>>> GetPending(
    [FromQuery] Guid conversationId,
    CancellationToken cancellationToken)
  {
    var actions = await _getPendingService.GetAsync(conversationId, cancellationToken);

    return Ok(actions);
  }
}