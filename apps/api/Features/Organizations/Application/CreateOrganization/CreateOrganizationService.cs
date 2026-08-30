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

    public async Task<CreateOrganizationResponse> CreateAsync(CreateOrganizationRequest request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();

        var alreadyExists = await _repository.ExistsByNameAsync(name, cancellationToken);

        if (alreadyExists)
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
}