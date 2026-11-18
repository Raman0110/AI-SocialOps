namespace SocialOps.Api.Features.Identity.Application.Dtos;

public sealed record LoginRequest(string Email, string Password, Guid? OrganizationId);

public sealed record SwitchOrganizationRequest(Guid OrganizationId);

public sealed record AuthUserResponse(Guid Id, string Name, string Email);

public sealed record AuthOrganizationResponse(Guid Id, string Name, string Role);

public sealed record AuthSessionResponse(
    string AccessToken,
    DateTime ExpiresAtUtc,
    AuthUserResponse User,
    AuthOrganizationResponse Organization,
    IReadOnlyList<AuthOrganizationResponse> Memberships);

public sealed record CurrentSessionResponse(
    AuthUserResponse User,
    AuthOrganizationResponse Organization,
    IReadOnlyList<AuthOrganizationResponse> Memberships);
