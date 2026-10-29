using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Features.AI.Application.AnalyzeMessage;
using SocialOps.Api.Features.AI.Application.AnalyzeMessage.Dtos;
using SocialOps.Api.Features.AI.Application.AnalyzeMessage.Services;

namespace SocialOps.Api.Features.AI.Controllers;

[ApiController]
[Authorize(Policy = SocialOpsPolicies.TenantOperator)]
[Route("api/ai")]
public sealed class AiController : ControllerBase
{
    private readonly AnalyzeMessageService _service;

    public AiController(AnalyzeMessageService service)
    {
        _service = service;
    }

    [HttpPost("analyze-message")]
    public async Task<ActionResult<AnalyzeMessageResponse>> AnalyzeMessage([FromBody] AnalyzeMessageRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.AnalyzeAsync(request, cancellationToken);

        return Ok(result);
    }
}