namespace SocialOps.Api.Shared.Exceptions;

public sealed class TenantAccessDeniedException : Exception
{
    public TenantAccessDeniedException(string message) : base(message)
    {
    }
}
