namespace SocialOps.Api.Shared.Auth;

public static class SocialOpsRoles
{
    public const string Owner = "Owner";
    public const string Admin = "Admin";
    public const string Agent = "Agent";
    public const string Viewer = "Viewer";

    public static readonly string[] TenantReaders =
    [
        Owner,
        Admin,
        Agent,
        Viewer
    ];

    public static readonly string[] TenantOperators =
    [
        Owner,
        Admin,
        Agent
    ];

    public static readonly string[] TenantAdmins =
    [
        Owner,
        Admin
    ];
}
