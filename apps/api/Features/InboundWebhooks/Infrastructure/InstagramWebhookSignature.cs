using System.Security.Cryptography;
using System.Text;

namespace SocialOps.Api.Features.InboundWebhooks.Infrastructure;

public static class InstagramWebhookSignature
{
    private const string Prefix = "sha256=";

    // Meta signs the raw request body with the app secret (HMAC-SHA256, hex) and sends it
    // as "X-Hub-Signature-256: sha256=<hex>". The comparison must be constant time.
    public static bool IsValid(byte[] body, string? header, string appSecret)
    {
        if (string.IsNullOrWhiteSpace(header) ||
            !header.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        byte[] provided;

        try
        {
            provided = Convert.FromHexString(header[Prefix.Length..].Trim());
        }
        catch (FormatException)
        {
            return false;
        }

        var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(appSecret), body);

        return CryptographicOperations.FixedTimeEquals(provided, expected);
    }

    public static string Compute(byte[] body, string appSecret)
    {
        var hash = HMACSHA256.HashData(Encoding.UTF8.GetBytes(appSecret), body);

        return Prefix + Convert.ToHexString(hash).ToLowerInvariant();
    }
}
