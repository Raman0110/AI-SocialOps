using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.Organizations.Domain;
using SocialOps.Api.Shared.Persistence;

namespace SocialOps.Api.Features.Organizations.Infrastructure;

public sealed class OrganizationRepository: IOrganizationRepository
{
    private readonly SocialOpsDbContext _dbContext;
    private readonly DbSet<Organization> _dbSet;

    public OrganizationRepository(SocialOpsDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = dbContext.Set<Organization>();
    }

    public async Task AddAsync(Organization organization, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(organization, cancellationToken);
    }

    public Task<Organization?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbSet.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Organization>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return _dbSet.AnyAsync(x => x.Name == name, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}