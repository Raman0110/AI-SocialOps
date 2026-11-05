namespace SocialOps.Api.Shared.Integrations;

// Bound from the "Instagram" configuration section. Secrets belong in environment
// variables or a secret store, never in appsettings.json.
public sealed class InstagramOptions
{
    public const string SectionName = "Instagram";

    // Meta app secret used to verify the X-Hub-Signature-256 header on webhook deliveries.
    public string? AppSecret { get; set; }

    // Arbitrary string you also enter in the Meta dashboard when subscribing the webhook.
    public string? VerifyToken { get; set; }

    public string GraphBaseUrl { get; set; } = "https://graph.instagram.com";

    public string GraphApiVersion { get; set; } = "v21.0";

    // Access token per connected Instagram business account, keyed by the account's
    // ExternalAccountId (the same value stored on the social account).
    public Dictionary<string, string> AccessTokens { get; set; } = new();

    public bool WebhooksConfigured =>
        !string.IsNullOrWhiteSpace(AppSecret) && !string.IsNullOrWhiteSpace(VerifyToken);

    // Blank values count as missing so an empty environment variable does not switch on a sender
    // that has no token to use.
    public bool SendingConfigured => AccessTokens.Values.Any(token => !string.IsNullOrWhiteSpace(token));
}
