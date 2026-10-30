using SocialOps.Api.Features.Organizations.Domain;

namespace SocialOps.Api.Features.Knowledge.Domain;

public class KnowledgeEntry
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }

    public required string Title { get; set; }

    public required string Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Organization Organization { get; set; } = null!;
}
