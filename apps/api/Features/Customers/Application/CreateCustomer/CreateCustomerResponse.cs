namespace SocialOps.Api.Features.Customers.Application.CreateCustomer;

public sealed record CreateCustomerResponse(
    Guid Id,
    Guid OrganizationId,
    string Name,
    string? Email,
    string? PhoneNumber,
    DateTime CreatedAt
);