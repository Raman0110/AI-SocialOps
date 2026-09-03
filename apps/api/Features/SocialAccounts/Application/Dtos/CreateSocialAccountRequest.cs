using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.SocialAccounts.Application.Dtos;

public sealed record CreateSocialAccountRequest(
    Guid OrganizationId,
    SocialPlatform Platform,
    string ExternalAccountId,
    string DisplayName
);