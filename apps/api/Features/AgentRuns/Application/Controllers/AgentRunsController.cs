using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.AgentRuns.Application.Dtos;
using SocialOps.Api.Features.AgentRuns.Application.Services;

namespace SocialOps.Api.Features.AgentRuns.Controllers;

[ApiController]
[Route("api/agent-runs")]
public sealed class AgentRunsController : ControllerBase
{
  private readonly GetAgentRunsService _service;

  public AgentRunsController(GetAgentRunsService service)
  {
    _service = service;
  }

  [HttpGet]
  public async Task<ActionResult<IReadOnlyList<AgentRunSummaryResponse>>> GetByConversation(
      [FromQuery] Guid organizationId,
      [FromQuery] Guid conversationId,
      [FromQuery] int? limit,
      CancellationToken cancellationToken)
  {
    var response = await _service.GetByConversationAsync(
        conversationId,
        organizationId,
        limit,
        cancellationToken);

    return Ok(response);
  }

  [HttpGet("{id:guid}")]
  public async Task<ActionResult<AgentRunDetailResponse>> GetById(
      Guid id,
      [FromQuery] Guid organizationId,
      CancellationToken cancellationToken)
  {
    var response = await _service.GetByIdAsync(id, organizationId, cancellationToken);

    if (response is null) return NotFound();

    return Ok(response);
  }
}
