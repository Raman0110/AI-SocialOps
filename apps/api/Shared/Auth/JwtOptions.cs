namespace SocialOps.Api.Shared.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Authentication:Jwt";

    public string Issuer { get; set; } = "SocialOps";

    public string Audience { get; set; } = "SocialOps.Web";

    public string SigningKey { get; set; } = string.Empty;

    public int AccessTokenMinutes { get; set; } = 60;
}
