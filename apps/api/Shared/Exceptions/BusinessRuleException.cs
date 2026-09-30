namespace SocialOps.Api.Shared.Exceptions;

public sealed class BusinessRuleException : Exception
{
  public BusinessRuleException(string message) : base(message)
  {
  }
}
