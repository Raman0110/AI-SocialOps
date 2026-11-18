namespace SocialOps.Api.Features.Identity.Application.Dtos;

public sealed record MembershipResponse(
    Guid Id,
    Guid UserId,
    string Name,
    string Email,
    string Role,
    DateTime CreatedAt);

public sealed record CreateMembershipRequest(
    string Name,
    string Email,
    string? TemporaryPassword,
    string Role);

public sealed record UpdateMembershipRoleRequest(string Role);
