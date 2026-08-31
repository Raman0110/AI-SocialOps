using SocialOps.Api.Features.Customers.Domain;

namespace SocialOps.Api.Features.Customers.Application.Abstractions;

public interface ICustomerRepository
{
    Task AddAsync(Customer customer, CancellationToken cancellationToken = default);

    Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Customer>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(Guid organizationId, string email, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}