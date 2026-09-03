using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.SocialAccounts.Application.Dtos;

public sealed record SocialAccountResponse(
    Guid Id,
    Guid OrganizationId,
    SocialPlatform Platform,
    string ExternalAccountId,
    string DisplayName,
    bool IsActive,
    DateTime CreatedAt
);