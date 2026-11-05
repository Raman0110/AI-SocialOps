using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SocialOps.Api.Features.InboundWebhooks.Application.Services;
using SocialOps.Api.Features.InboundWebhooks.Infrastructure;
using SocialOps.Api.Shared.Exceptions;
using SocialOps.Api.Shared.Integrations;

namespace SocialOps.Api.Features.InboundWebhooks.Application.Controllers;

// Endpoints Meta calls. They are anonymous by design; the verify token (GET) and the
// HMAC signature (POST) are what authenticate Meta.
[ApiController]
[Route("api/webhooks/instagram")]
public sealed class InstagramWebhooksController : ControllerBase
{
    private const int MaxBodyBytes = 1_000_000;

    private readonly InstagramOptions _options;
    private readonly InboundWebhookIngestionService _ingestionService;
    private readonly ILogger<InstagramWebhooksController> _logger;

    public InstagramWebhooksController(
        IOptions<InstagramOptions> options,
        InboundWebhookIngestionService ingestionService,
        ILogger<InstagramWebhooksController> logger)
    {
        _options = options.Value;
        _ingestionService = ingestionService;
        _logger = logger;
    }

    // Meta calls this once when the webhook is subscribed in the app dashboard.
    [HttpGet]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? verifyToken,
        [FromQuery(Name = "hub.challenge")] string? challenge)
    {
        if (!_options.WebhooksConfigured)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable);
        }

        if (mode != "subscribe" ||
            challenge is null ||
            !TokensMatch(verifyToken, _options.VerifyToken!))
        {
            return Forbid();
        }

        return Content(challenge, "text/plain");
    }

    [HttpPost]
    public async Task<IActionResult> Receive(CancellationToken cancellationToken)
    {
        if (!_options.WebhooksConfigured)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable);
        }

        if (Request.ContentLength > MaxBodyBytes)
        {
            return StatusCode(StatusCodes.Status413PayloadTooLarge);
        }

        var body = await ReadBodyAsync(cancellationToken);

        if (body is null)
        {
            return StatusCode(StatusCodes.Status413PayloadTooLarge);
        }

        var signature = Request.Headers["X-Hub-Signature-256"].FirstOrDefault();

        if (!InstagramWebhookSignature.IsValid(body, signature, _options.AppSecret!))
        {
            _logger.LogWarning("Rejected an Instagram webhook with a missing or invalid signature.");

            return Unauthorized();
        }

        IReadOnlyList<Application.Dtos.NormalizedInboundMessage> messages;

        try
        {
            messages = InstagramWebhookParser.Parse(Encoding.UTF8.GetString(body));
        }
        catch (JsonException)
        {
            return BadRequest();
        }

        foreach (var message in messages)
        {
            try
            {
                await _ingestionService.IngestAsync(message, cancellationToken);
            }
            catch (Exception exception) when (exception is ResourceNotFoundException or BusinessRuleException)
            {
                // Retrying will not help (unknown or inactive account), so acknowledge the
                // delivery instead of making Meta redeliver it.
                _logger.LogWarning(
                    "Ignored an Instagram message for account {Account}: {Reason}",
                    message.ExternalAccountId,
                    exception.Message);
            }
        }

        return Ok(new { received = messages.Count });
    }

    private async Task<byte[]?> ReadBodyAsync(CancellationToken cancellationToken)
    {
        using var buffer = new MemoryStream();
        var chunk = new byte[16 * 1024];
        int read;

        while ((read = await Request.Body.ReadAsync(chunk, cancellationToken)) > 0)
        {
            if (buffer.Length + read > MaxBodyBytes)
            {
                return null;
            }

            buffer.Write(chunk, 0, read);
        }

        return buffer.ToArray();
    }

    private static bool TokensMatch(string? provided, string expected)
    {
        if (provided is null)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(
            SHA256.HashData(Encoding.UTF8.GetBytes(provided)),
            SHA256.HashData(Encoding.UTF8.GetBytes(expected)));
    }
}
