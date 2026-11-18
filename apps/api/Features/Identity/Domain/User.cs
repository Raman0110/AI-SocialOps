namespace SocialOps.Api.Features.Identity.Domain;

public sealed class User
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public required string Email { get; set; }

    public required string NormalizedEmail { get; set; }

    public required string PasswordHash { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrganizationMembership> Memberships { get; set; } = [];
}
