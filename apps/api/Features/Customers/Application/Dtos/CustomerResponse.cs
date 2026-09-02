namespace SocialOps.Api.Features.Customers.Application.Dtos;

public sealed record CustomerResponse(
    Guid Id,
    Guid OrganizationId,
    string Name,
    string? Email,
    string? PhoneNumber,
    DateTime CreatedAt
);