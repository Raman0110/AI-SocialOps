using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.Organizations.Domain;
using SocialOps.Api.Shared.Persistence;

namespace SocialOps.Api.Features.Organizations.Infrastructure;

public sealed class OrganizationRepository: IOrganizationRepository
{
    private readonly SocialOpsDbContext _dbContext;

    public OrganizationRepository(SocialOpsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Organization organization, CancellationToken cancellationToken = default)
    {
        await _dbContext.Organizations.AddAsync(organization, cancellationToken);
    }

    public Task<Organization?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Organizations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Organization>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Organizations
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return _dbContext.Organizations.AnyAsync(x => x.Name == name, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}