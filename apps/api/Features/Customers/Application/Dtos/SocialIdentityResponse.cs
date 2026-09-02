using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.Customers.Application.Dtos;

public sealed record SocialIdentityResponse(
    Guid Id,
    Guid CustomerId,
    SocialPlatform Platform,
    string ExternalUserId,
    string Username,
    DateTime CreatedAt
);