using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.SocialAccounts.Application.Abstractions;

public interface ISocialAccountRepository
{
    Task AddAsync(SocialAccount socialAccount, CancellationToken cancellationToken = default);

    Task<SocialAccount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SocialAccount>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        Guid organizationId,
        SocialPlatform platform,
        string externalAccountId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}