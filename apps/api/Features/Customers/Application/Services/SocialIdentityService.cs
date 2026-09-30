using SocialOps.Api.Features.Customers.Application.Abstraction;
using SocialOps.Api.Features.Customers.Application.Abstractions;
using SocialOps.Api.Features.Customers.Application.Dtos;
using SocialOps.Api.Features.Customers.Application.Dtos.CreateSocialIdentity;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.Customers.Application.Services;

public sealed class SocialIdentityService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly ISocialIdentityRepository _socialIdentityRepository;

    public SocialIdentityService(
        ICustomerRepository customerRepository,
        ISocialIdentityRepository socialIdentityRepository)
    {
        _customerRepository = customerRepository;
        _socialIdentityRepository = socialIdentityRepository;
    }

    public async Task<SocialIdentityResponse> CreateAsync(
        CreateSocialIdentityRequest request,
        CancellationToken cancellationToken = default)
    {
        var customer = await _customerRepository.GetByIdAsync(
            request.CustomerId,
            cancellationToken);

        if (customer is null) throw new ResourceNotFoundException("Customer does not exist.");

        var externalUserId = request.ExternalUserId.Trim();

        var exists = await _socialIdentityRepository.ExistsAsync(
            request.Platform,
            externalUserId,
            cancellationToken);

        if (exists) throw new ConflictException("This social identity is already linked.");

        var socialIdentity = new SocialIdentity
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            Platform = request.Platform,
            ExternalUserId = externalUserId,
            Username = request.Username.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _socialIdentityRepository.AddAsync(socialIdentity, cancellationToken);

        await _socialIdentityRepository.SaveChangesAsync(cancellationToken);

        return new SocialIdentityResponse(
            socialIdentity.Id,
            socialIdentity.CustomerId,
            socialIdentity.Platform,
            socialIdentity.ExternalUserId,
            socialIdentity.Username,
            socialIdentity.CreatedAt);
    }

    public async Task<IReadOnlyList<SocialIdentityResponse>> GetByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        var identities = await _socialIdentityRepository.GetByCustomerIdAsync(customerId, cancellationToken);

        return identities
            .Select(x => new SocialIdentityResponse(
                x.Id,
                x.CustomerId,
                x.Platform,
                x.ExternalUserId,
                x.Username,
                x.CreatedAt))
            .ToList();
    }
}
