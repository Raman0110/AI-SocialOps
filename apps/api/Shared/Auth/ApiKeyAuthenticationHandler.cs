using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace SocialOps.Api.Shared.Auth;

public sealed class ApiKeyAuthenticationHandler : AuthenticationHandler<ApiKeyAuthenticationOptions>
{
    public ApiKeyAuthenticationHandler(
        IOptionsMonitor<ApiKeyAuthenticationOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(Options.HeaderName, out var values))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var apiKey = values.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return Task.FromResult(AuthenticateResult.Fail("API key is required."));
        }

        var credential = Options.Keys.FirstOrDefault(x => x.Key == apiKey);

        if (credential is null)
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid API key."));
        }

        if (credential.OrganizationId == Guid.Empty)
        {
            return Task.FromResult(AuthenticateResult.Fail("API key organization is invalid."));
        }

        if (string.IsNullOrWhiteSpace(credential.Role))
        {
            return Task.FromResult(AuthenticateResult.Fail("API key role is invalid."));
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, credential.Name ?? credential.OrganizationId.ToString()),
            new(ClaimTypes.Name, credential.Name ?? "API key"),
            new(ClaimTypes.Role, credential.Role),
            new(SocialOpsClaimTypes.OrganizationId, credential.OrganizationId.ToString())
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
