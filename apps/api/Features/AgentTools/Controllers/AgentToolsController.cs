using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Application.Dtos.GetCustomerContext;
using SocialOps.Api.Features.Conversations.Application.Services;
using SocialOps.Api.Features.Conversations.Application.Services.GetCustomerContext;

namespace SocialOps.Api.Features.AgentTools.Controllers;

[ApiController]
[Route("internal/agent-tools")]
public sealed class AgentToolsController : ControllerBase
{
  private readonly GetCustomerContextService _customerContextService;
  private readonly GetConversationHistoryService _conversationHistoryService;

  public AgentToolsController(GetCustomerContextService customerContextService, GetConversationHistoryService conversationHistoryService)
  {
    _customerContextService = customerContextService;
    _conversationHistoryService = conversationHistoryService;
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
}