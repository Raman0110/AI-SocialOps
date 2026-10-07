using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.AgentActions.Application.Dtos;
using SocialOps.Api.Features.AgentActions.Application.GetPendingActions;
using SocialOps.Api.Features.AgentActions.Application.Services.ApproveAgentAction;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.AgentActions.Controllers;

[ApiController]
[Authorize(Policy = SocialOpsPolicies.TenantReader)]
[Route("api/agent-actions")]
public sealed class AgentActionsController : ControllerBase
{
  private readonly AgentActionService _agentActionService;
  private readonly GetPendingAgentActionsService _getPendingService;
  private readonly ITenantContext _tenantContext;

  public AgentActionsController(
    AgentActionService agentActionService,
    GetPendingAgentActionsService getPendingService,
    ITenantContext tenantContext)
  {
    _agentActionService = agentActionService;
    _getPendingService = getPendingService;
    _tenantContext = tenantContext;
  }

  [HttpPost("{id:guid}/approve")]
  [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
  public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
  {
    var organizationId = _tenantContext.RequireOrganizationId();
    var ticketId = await _agentActionService.ApproveAsync(id, organizationId, cancellationToken);

    if (ticketId is null) return NotFound();

    return Ok(new
    {
      ticketId
    });
  }

  [HttpPost("{id:guid}/reject")]
  [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
  public async Task<IActionResult> Reject(Guid id, CancellationToken cancellationToken)
  {
    var organizationId = _tenantContext.RequireOrganizationId();
    var success = await _agentActionService.RejectAsync(id, organizationId, cancellationToken);

    if (!success) return NotFound();

    return NoContent();
  }

  [HttpGet]
  public async Task<ActionResult<IReadOnlyList<GetPendingAgentActionResponse>>> GetPending(
    [FromQuery] Guid conversationId,
    CancellationToken cancellationToken)
  {
    var organizationId = _tenantContext.RequireOrganizationId();
    var actions = await _getPendingService.GetAsync(conversationId, organizationId, cancellationToken);

    return Ok(actions);
  }
}
