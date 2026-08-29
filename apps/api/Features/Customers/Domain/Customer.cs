using Microsoft.VisualBasic;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Organizations.Domain;

namespace SocialOps.Api.Features.Customers.Domain;

public class Customer
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }

    public required string Name { get; set; }

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Organization Organization { get; set; } = null!;

    public ICollection<SocialIdentity> SocialIdentities { get; set; } = new List<SocialIdentity>();

    public ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
}