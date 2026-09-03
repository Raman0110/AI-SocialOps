using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.SocialAccounts.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Domain;
using SocialOps.Api.Shared.Persistence;

namespace SocialOps.Api.Features.SocialAccounts.Infrastructure;

public sealed class SocialAccountRepository: ISocialAccountRepository
{
    private readonly SocialOpsDbContext _dbContext;
    private readonly DbSet<SocialAccount> _dbSet;

    public SocialAccountRepository(SocialOpsDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = dbContext.Set<SocialAccount>();
    }

    public async Task AddAsync(
        SocialAccount socialAccount,
        CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(
            socialAccount,
            cancellationToken);
    }

    public Task<SocialAccount?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyList<SocialAccount>> GetByOrganizationIdAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.Platform)
            .ThenBy(x => x.DisplayName)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsAsync(
        Guid organizationId,
        SocialPlatform platform,
        string externalAccountId,
        CancellationToken cancellationToken = default)
    {
        return _dbSet
            .AnyAsync(
                x =>
                    x.OrganizationId == organizationId &&
                    x.Platform == platform &&
                    x.ExternalAccountId == externalAccountId,
                cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}