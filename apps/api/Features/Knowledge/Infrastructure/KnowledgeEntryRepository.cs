using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Knowledge.Application.Abstractions;
using SocialOps.Api.Features.Knowledge.Domain;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Features.Knowledge.Infrastructure;

public sealed class KnowledgeEntryRepository : IKnowledgeEntryRepository
{
    private readonly SocialOpsDbContext _dbContext;
    private readonly DbSet<KnowledgeEntry> _dbSet;

    public KnowledgeEntryRepository(SocialOpsDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = dbContext.Set<KnowledgeEntry>();
    }

    public async Task AddAsync(KnowledgeEntry entry, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entry, cancellationToken);
    }

    public Task<KnowledgeEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbSet.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<KnowledgeEntry>> GetByOrganizationIdAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.Title)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        return _dbSet.CountAsync(x => x.OrganizationId == organizationId, cancellationToken);
    }

    public void Remove(KnowledgeEntry entry)
    {
        _dbSet.Remove(entry);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}
