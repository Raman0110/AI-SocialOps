using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.Customers.Application.Abstraction
{
    public interface ISocialIdentityRepository
    {
        Task AddAsync(SocialIdentity socialIdentity, CancellationToken cancellationToken = default);

        Task<SocialIdentity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<SocialIdentity?> GetByPlatformAndExternalUserIdAsync(
            SocialPlatform platform,
            string externalUserId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<SocialIdentity>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

        Task<bool> ExistsAsync(SocialPlatform platform, string externalUserId, CancellationToken cancellationToken = default);

        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
