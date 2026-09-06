using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.Organizations.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.Conversations.Domain;

public class Conversation
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }

    public Guid CustomerId { get; set; }

    public Guid SocialAccountId { get; set; }

    public Guid SocialIdentityId { get; set; }

    public ConversationStatus Status { get; set; } = ConversationStatus.Open;

    public string? ExternalConversationId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastMessageAt { get; set; }

    public Organization Organization { get; set; } = null!;

    public Customer Customer { get; set; } = null!;

    public SocialAccount SocialAccount { get; set; } = null!;

    public SocialIdentity SocialIdentity { get; set; } = null!;

    public ICollection<Message> Messages { get; set; } = new List<Message>();
}