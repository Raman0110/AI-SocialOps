using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.Customers.Application.Dtos.CreateSocialIdentity;

public sealed record CreateSocialIdentityRequest(
    Guid CustomerId,
    SocialPlatform Platform,
    string ExternalUserId,
    string Username
);