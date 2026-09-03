using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Application.Dtos;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.SocialAccounts.Application.Services;

public sealed class SocialAccountService
{
    private readonly ISocialAccountRepository _socialAccountRepository;
    private readonly IOrganizationRepository _organizationRepository;

    public SocialAccountService(
        ISocialAccountRepository socialAccountRepository,
        IOrganizationRepository organizationRepository)
    {
        _socialAccountRepository = socialAccountRepository;
        _organizationRepository = organizationRepository;
    }

    public async Task<SocialAccountResponse> CreateAsync(CreateSocialAccountRequest request, CancellationToken cancellationToken = default)
    {
        var organization = await _organizationRepository.GetByIdAsync(
                request.OrganizationId,
                cancellationToken);

        if (organization is null) throw new InvalidOperationException("Organization does not exist.");

        var externalAccountId = request.ExternalAccountId.Trim();

        var exists = await _socialAccountRepository.ExistsAsync(
                request.OrganizationId,
                request.Platform,
                externalAccountId,
                cancellationToken);

        if (exists) throw new InvalidOperationException("This social account is already connected.");

        var socialAccount = new SocialAccount
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            Platform = request.Platform,
            ExternalAccountId = externalAccountId,
            DisplayName = request.DisplayName.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _socialAccountRepository.AddAsync(socialAccount, cancellationToken);

        await _socialAccountRepository.SaveChangesAsync(cancellationToken);

        return new SocialAccountResponse(
            socialAccount.Id,
            socialAccount.OrganizationId,
            socialAccount.Platform,
            socialAccount.ExternalAccountId,
            socialAccount.DisplayName,
            socialAccount.IsActive,
            socialAccount.CreatedAt);
    }

    public async Task<SocialAccountResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var account = await _socialAccountRepository.GetByIdAsync(
                id,
                cancellationToken);

        if (account is null) return null;

        return new SocialAccountResponse(
            account.Id,
            account.OrganizationId,
            account.Platform,
            account.ExternalAccountId,
            account.DisplayName,
            account.IsActive,
            account.CreatedAt);
    }

    public async Task<IReadOnlyList<SocialAccountResponse>>
    GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        var accounts = await _socialAccountRepository.GetByOrganizationIdAsync(
                organizationId,
                cancellationToken);

        return accounts
            .Select(x => new SocialAccountResponse(
                x.Id,
                x.OrganizationId,
                x.Platform,
                x.ExternalAccountId,
                x.DisplayName,
                x.IsActive,
                x.CreatedAt))
            .ToList();
    }
}