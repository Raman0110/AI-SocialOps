namespace SocialOps.Api.Features.InboundWebhooks.Application.Dtos;

public sealed record SandboxInstagramWebhookRequest(
    string BusinessAccountId,
    string SenderId,
    string? SenderUsername,
    string ConversationId,
    string MessageId,
    string Text,
    DateTime? SentAt);
