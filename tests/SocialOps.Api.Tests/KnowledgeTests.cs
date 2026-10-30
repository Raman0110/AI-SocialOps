using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace SocialOps.Api.Tests;

public sealed class KnowledgeTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public KnowledgeTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private static object Entry(string title, string content) => new { title, content };

    [Fact]
    public async Task Search_returns_best_matching_entries_ranked_by_title_then_content()
    {
        var admin = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyA);
        await admin.PostAsJsonAsync("/api/knowledge", Entry("Refund policy", "Refunds are issued within 7 days."));
        await admin.PostAsJsonAsync("/api/knowledge", Entry("Shipping times", "We ship within 2 days; refund of shipping is not possible."));
        await admin.PostAsJsonAsync("/api/knowledge", Entry("Opening hours", "Open 9 to 5."));

        var agent = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);
        var body = await agent.GetStringAsync("/internal/agent-tools/knowledge/search?query=what%20is%20your%20refund%20policy");

        var titles = JsonDocument.Parse(body).RootElement.GetProperty("results")
            .EnumerateArray().Select(x => x.GetProperty("title").GetString()).ToList();

        Assert.Equal("Refund policy", titles.First());
        Assert.DoesNotContain("Opening hours", titles);
    }

    [Fact]
    public async Task Search_never_returns_another_organizations_entries()
    {
        var adminB = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyB);
        await adminB.PostAsJsonAsync("/api/knowledge", Entry("Secret warranty terms", "Org B only warranty details."));

        var agentA = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);
        var body = await agentA.GetStringAsync("/internal/agent-tools/knowledge/search?query=warranty");

        Assert.DoesNotContain("Secret warranty terms", body);
    }

    [Fact]
    public async Task Listing_only_shows_own_entries()
    {
        var adminB = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyB);
        await adminB.PostAsJsonAsync("/api/knowledge", Entry("Only for B", "private"));

        var adminA = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyA);
        var body = await adminA.GetStringAsync("/api/knowledge");

        Assert.DoesNotContain("Only for B", body);
    }

    [Fact]
    public async Task Cannot_delete_another_organizations_entry()
    {
        var adminB = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyB);
        var created = await adminB.PostAsJsonAsync("/api/knowledge", Entry("B entry", "content"));
        var id = JsonDocument.Parse(await created.Content.ReadAsStringAsync()).RootElement.GetProperty("id").GetGuid();

        var adminA = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyA);
        var response = await adminA.DeleteAsync($"/api/knowledge/{id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Only_admins_can_write_knowledge()
    {
        var agent = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var response = await agent.PostAsJsonAsync("/api/knowledge", Entry("x", "y"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_validates_input()
    {
        var admin = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyA);

        var response = await admin.PostAsJsonAsync("/api/knowledge", Entry("", "content"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Search_requires_a_query()
    {
        var agent = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var response = await agent.GetAsync("/internal/agent-tools/knowledge/search");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
