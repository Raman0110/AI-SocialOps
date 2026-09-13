using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Customers.Application.Abstraction;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Features.Customers.Infrastructure
{
    public class SocialIdentityRepository:ISocialIdentityRepository
    {
        private readonly SocialOpsDbContext _dbContext;
        private readonly DbSet<SocialIdentity> _dbSet;

        public SocialIdentityRepository(SocialOpsDbContext context)
        {
            _dbContext = context;
            _dbSet = context.Set<SocialIdentity>();
        }

        public async Task AddAsync(SocialIdentity socialIdentity, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(socialIdentity, cancellationToken);
        }

        public Task<SocialIdentity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<IReadOnlyList<SocialIdentity>> GetByCustomerIdAsync(
            Guid customerId,
            CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(x=>x.CustomerId == customerId)
                .OrderBy(x=>x.Platform)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ExistsAsync(
            SocialPlatform platform,
            string externalUserId,
            CancellationToken cancellationToken = default) 
        { 
            return await _dbSet.AnyAsync(x => 
                x.Platform == platform &&
                x.ExternalUserId == externalUserId,
                cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
