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
    private readonly IConfiguration _configuration;

    public InboundWebhooksController(
        IInboundWebhookAdapter<SandboxInstagramWebhookRequest> instagramAdapter,
        InboundWebhookIngestionService ingestionService,
        IConfiguration configuration)
    {
        _instagramAdapter = instagramAdapter;
        _ingestionService = ingestionService;
        _configuration = configuration;
    }

    [HttpPost("instagram/sandbox")]
    public async Task<ActionResult<InboundWebhookResponse>> ReceiveSandboxInstagram(
        [FromBody] SandboxInstagramWebhookRequest request,
        CancellationToken cancellationToken)
    {
        // Anonymous and able to create conversations for any account, so only for development.
        if (!_configuration.GetValue<bool>("Webhooks:EnableSandbox"))
        {
            return NotFound();
        }

        var inboundMessage = _instagramAdapter.Normalize(request);
        var response = await _ingestionService.IngestAsync(inboundMessage, cancellationToken);

        return Ok(response);
    }
}
