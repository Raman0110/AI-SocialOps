using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.InboundWebhooks.Application.Dtos;

public sealed record NormalizedInboundMessage(
    SocialPlatform Platform,
    string ExternalAccountId,
    string ExternalUserId,
    string Username,
    string ExternalConversationId,
    string ExternalMessageId,
    string Text,
    DateTime SentAt);
