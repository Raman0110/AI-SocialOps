using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.Organizations.Application.CreateOrganization;
using SocialOps.Api.Features.Organizations.Domain;

namespace SocialOps.Api.Features.Organizations.Application.Services;

public sealed class CreateOrganizationService
{
    private readonly IOrganizationRepository _repository;

    public CreateOrganizationService(IOrganizationRepository repository)
    {
        _repository = repository;
    }

    public async Task<OrganizationResponse> CreateAsync(CreateOrganizationRequest request, CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();

        var exists = await _repository.ExistsByNameAsync(name, cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("An organization with this name already exists.");
        }

        var organization = new Organization
        {
            Id = Guid.NewGuid(),
            Name = name,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(organization, cancellationToken);

        await _repository.SaveChangesAsync(cancellationToken);

        return new OrganizationResponse(
            organization.Id,
            organization.Name,
            organization.CreatedAt);
    }

    public async Task<OrganizationResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var organization = await _repository.GetByIdAsync(id, cancellationToken);

        if (organization == null)
        {
            return null;
        }

        return new OrganizationResponse(
            organization.Id,
            organization.Name,
            organization.CreatedAt);
    }

    public async Task<IReadOnlyList<OrganizationResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var organizations = await _repository.GetAllAsync(cancellationToken);

        return organizations.Select(x => new OrganizationResponse(
                x.Id,
                x.Name,
                x.CreatedAt)).ToList();
    }
}