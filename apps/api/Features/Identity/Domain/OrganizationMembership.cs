using SocialOps.Api.Features.Organizations.Domain;

namespace SocialOps.Api.Features.Identity.Domain;

public sealed class OrganizationMembership
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid OrganizationId { get; set; }

    public MembershipRole Role { get; set; }

    public int Version { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public Organization Organization { get; set; } = null!;
}

public enum MembershipRole
{
    Owner,
    Admin,
    Agent,
    Viewer
}
