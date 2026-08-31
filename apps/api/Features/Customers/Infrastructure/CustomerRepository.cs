using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Customers.Application.Abstractions;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Shared.Persistence;

namespace SocialOps.Api.Features.Customers.Infrastructure
{
    public class CustomerRepository:ICustomerRepository
    {
        private readonly SocialOpsDbContext _dbContext;
        private readonly DbSet<Customer> _dbSet;

        public CustomerRepository(SocialOpsDbContext context)
        {
            _dbContext = context;
            _dbSet = context.Set<Customer>();
        }

        public async Task AddAsync(Customer customer, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(customer, cancellationToken);
        }

        public async Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<IReadOnlyList<Customer>> GetByOrganizationIdAsync(Guid OrganizationId, CancellationToken cancellationToken = default) 
        { 
            return await _dbSet
                .AsNoTracking()
                .Where(x=>x.OrganizationId == OrganizationId)
                .OrderBy(x=>x.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ExistsByEmailAsync(Guid organizationId, string email, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(x => x.OrganizationId == organizationId && x.Email == email, cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default) { 
            return _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
