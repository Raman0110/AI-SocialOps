using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.Organizations.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Tests;

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public static readonly Guid OrgA = Guid.Parse("aaaaaaaa-0000-0000-0000-000000000001");
    public static readonly Guid OrgB = Guid.Parse("bbbbbbbb-0000-0000-0000-000000000002");

    public const string KeyA = "key-org-a";
    public const string KeyB = "key-org-b";
    public const string ViewerKeyA = "key-org-a-viewer";

    public Guid ConversationA { get; } = Guid.NewGuid();
    public Guid ConversationB { get; } = Guid.NewGuid();

    private readonly string _databaseName = Guid.NewGuid().ToString();
    private bool _seeded;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // UseSetting is applied before Program's top-level code reads configuration;
        // ConfigureAppConfiguration runs too late for the eager checks in AddPersistence.
        foreach (var (key, value) in new Dictionary<string, string>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=unused",
                ["Agent:BaseUrl"] = "http://localhost:1",
                ["Authentication:ApiKey:Keys:0:Key"] = KeyA,
                ["Authentication:ApiKey:Keys:0:OrganizationId"] = OrgA.ToString(),
                ["Authentication:ApiKey:Keys:0:Role"] = "Agent",
                ["Authentication:ApiKey:Keys:1:Key"] = KeyB,
                ["Authentication:ApiKey:Keys:1:OrganizationId"] = OrgB.ToString(),
                ["Authentication:ApiKey:Keys:1:Role"] = "Agent",
                ["Authentication:ApiKey:Keys:2:Key"] = ViewerKeyA,
                ["Authentication:ApiKey:Keys:2:OrganizationId"] = OrgA.ToString(),
                ["Authentication:ApiKey:Keys:2:Role"] = "Viewer",
            })
        {
            builder.UseSetting(key, value);
        }

        builder.ConfigureServices(services =>
        {
            var descriptors = services
                .Where(d => d.ServiceType.FullName!.Contains("DbContextOptions") ||
                            d.ServiceType == typeof(SocialOpsDbContext))
                .ToList();

            foreach (var descriptor in descriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<SocialOpsDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName));
        });
    }

    public async Task<HttpClient> CreateClientWithKeyAsync(string? key)
    {
        await EnsureSeededAsync();

        var client = CreateClient();

        if (key is not null)
        {
            client.DefaultRequestHeaders.Add("X-Api-Key", key);
        }

        return client;
    }

    private async Task EnsureSeededAsync()
    {
        if (_seeded)
        {
            return;
        }

        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<SocialOpsDbContext>();

        AddOrganization(db, OrgA, ConversationA, "a");
        AddOrganization(db, OrgB, ConversationB, "b");
        await db.SaveChangesAsync();

        _seeded = true;
    }

    private static void AddOrganization(SocialOpsDbContext db, Guid orgId, Guid conversationId, string tag)
    {
        var customer = new Customer { Id = Guid.NewGuid(), OrganizationId = orgId, Name = $"Customer {tag}" };
        var account = new SocialAccount
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Platform = SocialPlatform.Instagram,
            ExternalAccountId = $"acct-{tag}",
            DisplayName = $"Shop {tag}"
        };
        var identity = new SocialIdentity
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            Platform = SocialPlatform.Instagram,
            ExternalUserId = $"user-{tag}",
            Username = $"user_{tag}"
        };

        db.Organizations.Add(new Organization { Id = orgId, Name = $"Org {tag}" });
        db.Customers.Add(customer);
        db.SocialAccounts.Add(account);
        db.SocialIdentities.Add(identity);
        db.Conversations.Add(new Conversation
        {
            Id = conversationId,
            OrganizationId = orgId,
            CustomerId = customer.Id,
            SocialAccountId = account.Id,
            SocialIdentityId = identity.Id
        });
    }
}
