using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Shared.Tenancy;

public sealed class HeaderTenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HeaderTenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid RequireOrganizationId()
    {
        var httpContext = _httpContextAccessor.HttpContext ?? throw new TenantContextRequiredException("Tenant context is not available.");

        var claimValue = httpContext.User.FindFirst(SocialOpsClaimTypes.OrganizationId)?.Value;

        if (Guid.TryParse(claimValue, out var claimOrganizationId) &&
            claimOrganizationId != Guid.Empty)
        {
            return claimOrganizationId;
        }

        throw new TenantContextRequiredException("An authenticated organization is required.");
    }

    public void EnsureOrganization(Guid organizationId)
    {
        var currentOrganizationId = RequireOrganizationId();

        if (currentOrganizationId != organizationId)
        {
            throw new TenantAccessDeniedException("The requested resource belongs to a different organization.");
        }
    }
}
