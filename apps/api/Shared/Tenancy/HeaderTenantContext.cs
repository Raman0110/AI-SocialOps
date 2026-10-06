using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Shared.Tenancy;

public sealed class HeaderTenantContext : ITenantContext
{
    public const string OrganizationHeaderName = "X-Organization-Id";

    private readonly IHttpContextAccessor _httpContextAccessor;

    public HeaderTenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid RequireOrganizationId()
    {
        var httpContext = _httpContextAccessor.HttpContext ?? throw new TenantContextRequiredException("Tenant context is not available.");

        if (!httpContext.Request.Headers.TryGetValue(OrganizationHeaderName, out var values) ||
            !Guid.TryParse(values.FirstOrDefault(), out var organizationId) ||
            organizationId == Guid.Empty)
        {
            throw new TenantContextRequiredException($"A valid {OrganizationHeaderName} header is required.");
        }

        return organizationId;
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
