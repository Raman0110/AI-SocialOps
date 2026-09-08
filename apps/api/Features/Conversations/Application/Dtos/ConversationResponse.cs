using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record CreateConversationResponse(
    Guid Id,
    Guid OrganizationId,
    Guid CustomerId,
    Guid SocialIdentityId,
    Guid SocialAccountId,
    ConversationStatus Status,
    string? ExternalConversationId,
    DateTime CreatedAt
);

public sealed record GetConversationResponse(
    Guid Id,
    string CustomerName,
    SocialPlatform Platform,
    string Username,
    string SocialAccountName,
    ConversationStatus Status,
    IReadOnlyList<GetConversationMessageResponse> Messages
);

public sealed record GetConversationMessageResponse(
    Guid Id,
    MessageDirection Direction,
    MessageSenderType SenderType,
    string Content,
    DateTime SentAt
);