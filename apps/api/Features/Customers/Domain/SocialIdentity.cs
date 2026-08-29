
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.Customers.Domain;

public class SocialIdentity
{
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    public SocialPlatform Platform { get; set; }

    public required string ExternalUserId { get; set; }

    public required string Username { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Customer Customer { get; set; } = null!;
}