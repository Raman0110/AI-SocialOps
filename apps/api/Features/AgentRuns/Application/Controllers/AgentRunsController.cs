using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.AgentRuns.Application.Dtos;
using SocialOps.Api.Features.AgentRuns.Application.Services;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.AgentRuns.Controllers;

[ApiController]
[Route("api/agent-runs")]
public sealed class AgentRunsController : ControllerBase
{
  private readonly GetAgentRunsService _service;
  private readonly ITenantContext _tenantContext;

  public AgentRunsController(
      GetAgentRunsService service,
      ITenantContext tenantContext)
  {
    _service = service;
    _tenantContext = tenantContext;
  }

  [HttpGet]
  public async Task<ActionResult<IReadOnlyList<AgentRunSummaryResponse>>> GetByConversation(
      [FromQuery] Guid? organizationId,
      [FromQuery] Guid conversationId,
      [FromQuery] int? limit,
      CancellationToken cancellationToken)
  {
    var tenantOrganizationId = _tenantContext.RequireOrganizationId();

    if (organizationId.HasValue)
    {
      _tenantContext.EnsureOrganization(organizationId.Value);
    }

    var response = await _service.GetByConversationAsync(
        conversationId,
        tenantOrganizationId,
        limit,
        cancellationToken);

    return Ok(response);
  }

  [HttpGet("{id:guid}")]
  public async Task<ActionResult<AgentRunDetailResponse>> GetById(
      Guid id,
      [FromQuery] Guid? organizationId,
      CancellationToken cancellationToken)
  {
    var tenantOrganizationId = _tenantContext.RequireOrganizationId();

    if (organizationId.HasValue)
    {
      _tenantContext.EnsureOrganization(organizationId.Value);
    }

    var response = await _service.GetByIdAsync(id, tenantOrganizationId, cancellationToken);

    if (response is null) return NotFound();

    return Ok(response);
  }
}
