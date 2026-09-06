namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record CreateConversationRequest(
    Guid OrganizationId,
    Guid CustomerId,
    Guid SocialIdentityId,
    Guid SocialAccountId,
    string? ExternalConversationId
);