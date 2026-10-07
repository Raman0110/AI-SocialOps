using Microsoft.AspNetCore.Authentication;

namespace SocialOps.Api.Shared.Auth;

public sealed class ApiKeyAuthenticationOptions : AuthenticationSchemeOptions
{
    public const string Scheme = "ApiKey";

    public string HeaderName { get; set; } = "X-Api-Key";

    public IReadOnlyList<ApiKeyCredential> Keys { get; set; } = [];
}
