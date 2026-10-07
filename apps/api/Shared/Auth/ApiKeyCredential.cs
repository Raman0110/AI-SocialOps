namespace SocialOps.Api.Shared.Auth;

public sealed class ApiKeyCredential
{
    public required string Key { get; set; }

    public required Guid OrganizationId { get; set; }

    public required string Role { get; set; }

    public string? Name { get; set; }
}
