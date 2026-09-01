namespace SocialOps.Api.Features.Organizations.Application.CreateOrganization;

public sealed record OrganizationResponse(
    Guid Id,
    string Name,
    DateTime CreatedAt
);