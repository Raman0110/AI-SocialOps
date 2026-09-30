
using SocialOps.Api.Features.Customers.Application.Abstractions;
using SocialOps.Api.Features.Customers.Application.CreateCustomer;
using SocialOps.Api.Features.Customers.Application.Dtos;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.Customers.Application.Services;

public sealed class CustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IOrganizationRepository _organizationRepository;

    public CustomerService(
        ICustomerRepository customerRepository,
        IOrganizationRepository organizationRepository)
    {
        _customerRepository = customerRepository;
        _organizationRepository = organizationRepository;
    }

    public async Task<CustomerResponse> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var organization = await _organizationRepository.GetByIdAsync(
            request.OrganizationId,
            cancellationToken);

        if (organization is null) throw new ResourceNotFoundException("Organization does not exist.");

        var email = request.Email?.Trim();

        if (!string.IsNullOrWhiteSpace(email))
        {
            var emailExists = await _customerRepository.ExistsByEmailAsync(
                    request.OrganizationId,
                    email,
                    cancellationToken);

            if (emailExists) throw new ConflictException("A customer with this email already exists.");
        }

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            Name = request.Name.Trim(),
            Email = email,
            PhoneNumber = request.PhoneNumber?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _customerRepository.AddAsync(customer, cancellationToken);

        await _customerRepository.SaveChangesAsync(cancellationToken);

        return new CustomerResponse(
            customer.Id,
            customer.OrganizationId,
            customer.Name,
            customer.Email,
            customer.PhoneNumber,
            customer.CreatedAt);
    }

    public async Task<CustomerResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _customerRepository.GetByIdAsync(id, cancellationToken);

        if (customer is null) return null;

        return new CustomerResponse(
            customer.Id,
            customer.OrganizationId,
            customer.Name,
            customer.Email,
            customer.PhoneNumber,
            customer.CreatedAt);
    }

    public async Task<IReadOnlyList<CustomerResponse>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        var customers = await _customerRepository.GetByOrganizationIdAsync(organizationId, cancellationToken);

        return customers
            .Select(x => new CustomerResponse(
                x.Id,
                x.OrganizationId,
                x.Name,
                x.Email,
                x.PhoneNumber,
                x.CreatedAt))
            .ToList();
    }
}
