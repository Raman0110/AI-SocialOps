using System.Text.Json;
using SocialOps.Api.Features.InboundWebhooks.Application.Dtos;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.InboundWebhooks.Infrastructure;

// Turns an Instagram messaging webhook delivery into normalized inbound messages.
// Only plain text messages from customers are returned; echoes of our own replies,
// read receipts, reactions and attachments-only messages are skipped.
public static class InstagramWebhookParser
{
    public static IReadOnlyList<NormalizedInboundMessage> Parse(string json)
    {
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        var messages = new List<NormalizedInboundMessage>();

        if (root.ValueKind != JsonValueKind.Object ||
            !root.TryGetProperty("entry", out var entries) ||
            entries.ValueKind != JsonValueKind.Array)
        {
            return messages;
        }

        foreach (var entry in entries.EnumerateArray())
        {
            var accountId = GetString(entry, "id");

            if (accountId is null ||
                !entry.TryGetProperty("messaging", out var events) ||
                events.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var item in events.EnumerateArray())
            {
                var parsed = ParseEvent(accountId, item);

                if (parsed is not null)
                {
                    messages.Add(parsed);
                }
            }
        }

        return messages;
    }

    private static NormalizedInboundMessage? ParseEvent(string accountId, JsonElement item)
    {
        if (!item.TryGetProperty("message", out var message) ||
            message.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (message.TryGetProperty("is_echo", out var echo) && echo.ValueKind == JsonValueKind.True)
        {
            return null;
        }

        var senderId = item.TryGetProperty("sender", out var sender) ? GetString(sender, "id") : null;
        var messageId = GetString(message, "mid");
        var text = GetString(message, "text");

        if (senderId is null || messageId is null || string.IsNullOrWhiteSpace(text) || senderId == accountId)
        {
            return null;
        }

        return new NormalizedInboundMessage(
            SocialPlatform.Instagram,
            accountId,
            senderId,
            // The webhook only carries the scoped id; resolving the username needs a profile lookup.
            senderId,
            // Instagram DMs have no conversation id in the webhook: one thread per customer and account.
            $"{accountId}:{senderId}",
            messageId,
            text.Trim(),
            ParseTimestamp(item));
    }

    private static DateTime ParseTimestamp(JsonElement item)
    {
        if (item.TryGetProperty("timestamp", out var timestamp) &&
            timestamp.ValueKind == JsonValueKind.Number &&
            timestamp.TryGetInt64(out var milliseconds))
        {
            try
            {
                return DateTimeOffset.FromUnixTimeMilliseconds(milliseconds).UtcDateTime;
            }
            catch (ArgumentOutOfRangeException)
            {
                // fall through to now
            }
        }

        return DateTime.UtcNow;
    }

    private static string? GetString(JsonElement element, string property)
    {
        if (element.ValueKind == JsonValueKind.Object &&
            element.TryGetProperty(property, out var value) &&
            value.ValueKind == JsonValueKind.String)
        {
            var text = value.GetString();

            return string.IsNullOrWhiteSpace(text) ? null : text;
        }

        return null;
    }
}
