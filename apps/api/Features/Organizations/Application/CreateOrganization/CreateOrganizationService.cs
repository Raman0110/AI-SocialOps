using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.Organizations.Domain;

namespace SocialOps.Api.Features.Organizations.Application.CreateOrganization;

public sealed class CreateOrganizationService
{
    private readonly IOrganizationRepository _repository;

    public CreateOrganizationService(IOrganizationRepository repository)
    {
        _repository = repository;
    }

    public async Task<CreateOrganizationResponse> CreateAsync(CreateOrganizationRequest request, CancellationToken cancellationToken = default)
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

        return new CreateOrganizationResponse(
            organization.Id,
            organization.Name,
            organization.CreatedAt);
    }

    public async Task<CreateOrganizationResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var organization = await _repository.GetByIdAsync(id, cancellationToken);

        if (organization == null)
        {
            return null;
        }

        return new CreateOrganizationResponse(
            organization.Id,
            organization.Name,
            organization.CreatedAt);
    }

    public async Task<IReadOnlyList<CreateOrganizationResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var organizations = await _repository.GetAllAsync(cancellationToken);

        return organizations.Select(x => new CreateOrganizationResponse(
                x.Id,
                x.Name,
                x.CreatedAt)).ToList();
    }
}