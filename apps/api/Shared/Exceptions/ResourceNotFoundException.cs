namespace SocialOps.Api.Shared.Exceptions;

public sealed class ResourceNotFoundException : Exception
{
  public ResourceNotFoundException(string message) : base(message)
  {
  }
}
