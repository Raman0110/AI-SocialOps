using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.InboundWebhooks.Application.Abstractions;
using SocialOps.Api.Features.InboundWebhooks.Application.Dtos;
using SocialOps.Api.Features.InboundWebhooks.Application.Services;

namespace SocialOps.Api.Features.InboundWebhooks.Application.Controllers;

[ApiController]
[Route("api/webhooks")]
public sealed class InboundWebhooksController : ControllerBase
{
    private readonly IInboundWebhookAdapter<SandboxInstagramWebhookRequest> _instagramAdapter;
    private readonly InboundWebhookIngestionService _ingestionService;

    public InboundWebhooksController(
        IInboundWebhookAdapter<SandboxInstagramWebhookRequest> instagramAdapter,
        InboundWebhookIngestionService ingestionService)
    {
        _instagramAdapter = instagramAdapter;
        _ingestionService = ingestionService;
    }

    [HttpPost("instagram/sandbox")]
    public async Task<ActionResult<InboundWebhookResponse>> ReceiveSandboxInstagram(
        [FromBody] SandboxInstagramWebhookRequest request,
        CancellationToken cancellationToken)
    {
        var inboundMessage = _instagramAdapter.Normalize(request);
        var response = await _ingestionService.IngestAsync(inboundMessage, cancellationToken);

        return Ok(response);
    }
}
