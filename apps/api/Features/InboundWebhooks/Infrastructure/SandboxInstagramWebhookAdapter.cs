using SocialOps.Api.Features.InboundWebhooks.Application.Abstractions;
using SocialOps.Api.Features.InboundWebhooks.Application.Dtos;
using SocialOps.Api.Features.SocialAccounts.Domain;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.InboundWebhooks.Infrastructure;

public sealed class SandboxInstagramWebhookAdapter : IInboundWebhookAdapter<SandboxInstagramWebhookRequest>
{
    public SocialPlatform Platform => SocialPlatform.Instagram;

    public NormalizedInboundMessage Normalize(SandboxInstagramWebhookRequest payload)
    {
        var businessAccountId = Require(payload.BusinessAccountId, "Business account id is required.");
        var senderId = Require(payload.SenderId, "Sender id is required.");
        var conversationId = Require(payload.ConversationId, "Conversation id is required.");
        var messageId = Require(payload.MessageId, "Message id is required.");
        var text = Require(payload.Text, "Message text is required.");
        var username = payload.SenderUsername?.Trim();

        return new NormalizedInboundMessage(
            Platform,
            businessAccountId,
            senderId,
            string.IsNullOrWhiteSpace(username) ? senderId : username,
            conversationId,
            messageId,
            text,
            NormalizeTimestamp(payload.SentAt));
    }

    private static string Require(string? value, string message)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessRuleException(message);
        }

        return value.Trim();
    }

    private static DateTime NormalizeTimestamp(DateTime? timestamp)
    {
        if (timestamp is null)
        {
            return DateTime.UtcNow;
        }

        return timestamp.Value.Kind switch
        {
            DateTimeKind.Utc => timestamp.Value,
            DateTimeKind.Local => timestamp.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(timestamp.Value, DateTimeKind.Utc)
        };
    }
}
