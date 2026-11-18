using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;
using SocialOps.Api.Features.Identity.Domain;


namespace SocialOps.Api.Features.Organizations.Domain;

public class Organization
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public ICollection<SocialAccount> SocialAccounts { get; set; } = new List<SocialAccount>();

    public ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();

    public ICollection<OrganizationMembership> Memberships { get; set; } = [];
}
