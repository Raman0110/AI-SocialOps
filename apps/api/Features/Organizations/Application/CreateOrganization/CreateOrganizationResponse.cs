namespace SocialOps.Api.Features.Organizations.Application.CreateOrganization;

public sealed record CreateOrganizationResponse(
    Guid Id,
    string Name,
    DateTime CreatedAt
);