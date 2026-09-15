using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Dtos.GetCustomerContext;

public sealed record GetCustomerContextResponse(
    Guid CustomerId,
    string CustomerName,
    string? Email,
    string? PhoneNumber,
    SocialPlatform Platform,
    string SocialUsername,
    string CompanySocialAccount
);