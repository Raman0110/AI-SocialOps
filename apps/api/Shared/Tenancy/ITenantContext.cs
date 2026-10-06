namespace SocialOps.Api.Shared.Tenancy;

public interface ITenantContext
{
    Guid RequireOrganizationId();

    void EnsureOrganization(Guid organizationId);
}
