using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.OutboundMessages.Application.Abstractions;

public interface IOutboundMessageSender
{
    SocialPlatform Platform { get; }

    Task<OutboundSendResult> SendAsync(OutboundMessage message, CancellationToken cancellationToken = default);
}

public sealed record OutboundMessage(
    string ExternalAccountId,
    string RecipientExternalUserId,
    string? ExternalConversationId,
    string Text
);

// Error is shown to operators in the inbox, so senders must keep it free of secrets.
public sealed record OutboundSendResult(
    bool Success,
    string? ExternalMessageId,
    string? Error
)
{
    public static OutboundSendResult Sent(string? externalMessageId) => new(true, externalMessageId, null);

    public static OutboundSendResult Failed(string error) => new(false, null, error);
}
