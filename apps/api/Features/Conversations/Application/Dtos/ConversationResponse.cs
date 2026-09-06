using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record ConversationResponse(
    Guid Id,
    Guid OrganizationId,
    Guid CustomerId,
    Guid SocialIdentityId,
    Guid SocialAccountId,
    ConversationStatus Status,
    string? ExternalConversationId,
    DateTime CreatedAt
);