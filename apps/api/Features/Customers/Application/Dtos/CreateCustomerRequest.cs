namespace SocialOps.Api.Features.Customers.Application.CreateCustomer;

public sealed record CreateCustomerRequest(
    Guid OrganizationId,
    string Name,
    string? Email,
    string? PhoneNumber
);