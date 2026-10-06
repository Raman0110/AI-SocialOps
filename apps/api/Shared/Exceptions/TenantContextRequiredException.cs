namespace SocialOps.Api.Shared.Exceptions;

public sealed class TenantContextRequiredException : Exception
{
    public TenantContextRequiredException(string message) : base(message)
    {
    }
}
