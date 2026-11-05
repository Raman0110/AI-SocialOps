using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using SocialOps.Api.Features.OutboundMessages.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Domain;
using SocialOps.Api.Shared.Integrations;

namespace SocialOps.Api.Features.OutboundMessages.Infrastructure;

// Sends Instagram DMs through the Graph API messaging endpoint. Every failure is returned as
// a result with a message that is safe to show in the inbox: it never contains the token.
public sealed class InstagramOutboundSender : IOutboundMessageSender
{
    public const string HttpClientName = "instagram-graph";

    // Instagram rejects text messages larger than 1000 bytes.
    private const int MaxTextBytes = 1000;

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly InstagramOptions _options;
    private readonly ILogger<InstagramOutboundSender> _logger;

    public InstagramOutboundSender(
        IHttpClientFactory httpClientFactory,
        IOptions<InstagramOptions> options,
        ILogger<InstagramOutboundSender> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    public SocialPlatform Platform => SocialPlatform.Instagram;

    public async Task<OutboundSendResult> SendAsync(OutboundMessage message, CancellationToken cancellationToken = default)
    {
        if (!_options.AccessTokens.TryGetValue(message.ExternalAccountId, out var accessToken) ||
            string.IsNullOrWhiteSpace(accessToken))
        {
            return OutboundSendResult.Failed("No Instagram access token is configured for this account.");
        }

        if (Encoding.UTF8.GetByteCount(message.Text) > MaxTextBytes)
        {
            return OutboundSendResult.Failed(
                $"This reply is too long for Instagram (limit is {MaxTextBytes} bytes). Shorten it and retry.");
        }

        var url = $"{_options.GraphBaseUrl.TrimEnd('/')}/{_options.GraphApiVersion}/{Uri.EscapeDataString(message.ExternalAccountId)}/messages";

        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(new
            {
                recipient = new { id = message.RecipientExternalUserId },
                message = new { text = message.Text }
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        try
        {
            var client = _httpClientFactory.CreateClient(HttpClientName);
            using var response = await client.SendAsync(request, cancellationToken);
            var content = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return OutboundSendResult.Sent(ReadMessageId(content));
            }

            var (code, reason) = ReadError(content);

            _logger.LogWarning(
                "Instagram rejected a message for account {Account} (HTTP {Status}, code {Code}).",
                message.ExternalAccountId,
                (int)response.StatusCode,
                code);

            return OutboundSendResult.Failed(DescribeError(code, reason, (int)response.StatusCode));
        }
        catch (Exception exception) when ((exception is HttpRequestException or TaskCanceledException) && !cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(exception, "Could not reach the Instagram API.");

            return OutboundSendResult.Failed("Could not reach Instagram. Try again in a moment.");
        }
    }

    private static string DescribeError(int? code, string? reason, int status)
    {
        if (code == 190)
        {
            return "The Instagram access token is invalid or expired. Reconnect the account.";
        }

        var detail = string.IsNullOrWhiteSpace(reason) ? $"HTTP {status}" : reason;

        return Truncate($"Instagram rejected the message: {detail}", 450);
    }

    private static string? ReadMessageId(string json)
    {
        try
        {
            using var document = JsonDocument.Parse(json);

            return document.RootElement.TryGetProperty("message_id", out var id) ? id.GetString() : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static (int? Code, string? Message) ReadError(string json)
    {
        try
        {
            using var document = JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty("error", out var error))
            {
                return (null, null);
            }

            int? code = error.TryGetProperty("code", out var c) && c.TryGetInt32(out var value) ? value : null;
            var message = error.TryGetProperty("message", out var m) ? m.GetString() : null;

            return (code, message);
        }
        catch (JsonException)
        {
            return (null, null);
        }
    }

    private static string Truncate(string value, int maxLength)
    {
        return value.Length <= maxLength ? value : value[..maxLength];
    }
}
