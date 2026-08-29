using Microsoft.VisualBasic;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Organizations.Domain;

namespace SocialOps.Api.Features.SocialAccounts.Domain;

public class SocialAccount
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }

    public SocialPlatform Platform { get; set; }

    public required string ExternalAccountId { get; set; }

    public required string DisplayName { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Organization Organization { get; set; } = null!;

    public ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
}