using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Conversations.Application.Dtos.GetCustomerContext;
using SocialOps.Api.Features.Conversations.Application.Services.GetCustomerContext;

namespace SocialOps.Api.Features.AgentTools.Controllers;

[ApiController]
[Route("internal/agent-tools")]
public sealed class AgentToolsController : ControllerBase
{
  private readonly GetCustomerContextService _customerContextService;

  public AgentToolsController(GetCustomerContextService customerContextService)
  {
    _customerContextService = customerContextService;
  }

  [HttpGet("conversations/{conversationId:guid}/customer-context")]
  public async Task<ActionResult<GetCustomerContextResponse>>
  GetCustomerContext(Guid conversationId, CancellationToken cancellationToken)
  {
    var response = await _customerContextService.GetAsync(conversationId, cancellationToken);

    if (response is null) return NotFound();

    return Ok(response);
  }
}