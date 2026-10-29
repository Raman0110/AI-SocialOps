using System.Net;
using System.Net.Http.Json;

namespace SocialOps.Api.Tests;

public sealed class TenantIsolationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public TenantIsolationTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Request_without_api_key_is_unauthorized()
    {
        var client = await _factory.CreateClientWithKeyAsync(null);

        var response = await client.GetAsync($"/internal/agent-tools/conversations/{_factory.ConversationA}/history");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Request_with_invalid_api_key_is_unauthorized()
    {
        var client = await _factory.CreateClientWithKeyAsync("nope");

        var response = await client.GetAsync("/api/conversations");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Organization_header_cannot_override_api_key_organization()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);
        client.DefaultRequestHeaders.Add("X-Organization-Id", ApiFactory.OrgB.ToString());

        var response = await client.GetAsync($"/api/conversations/{_factory.ConversationB}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("customer-context")]
    [InlineData("history")]
    public async Task Agent_tools_read_own_conversation(string endpoint)
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var response = await client.GetAsync($"/internal/agent-tools/conversations/{_factory.ConversationA}/{endpoint}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData("customer-context")]
    [InlineData("history")]
    public async Task Agent_tools_cannot_read_another_organizations_conversation(string endpoint)
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var response = await client.GetAsync($"/internal/agent-tools/conversations/{_factory.ConversationB}/{endpoint}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Agent_tools_cannot_propose_ticket_on_another_organizations_conversation()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var response = await client.PostAsJsonAsync(
            $"/internal/agent-tools/conversations/{_factory.ConversationB}/ticket-proposals",
            new { title = "x", description = "y", priority = 1 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Inbox_only_lists_own_conversations()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var body = await client.GetStringAsync("/api/conversations");

        Assert.Contains(_factory.ConversationA.ToString(), body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(_factory.ConversationB.ToString(), body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Viewer_cannot_call_operator_endpoints()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.ViewerKeyA);

        var response = await client.PostAsJsonAsync(
            $"/internal/agent-tools/conversations/{_factory.ConversationA}/ticket-proposals",
            new { title = "x", description = "y", priority = 1 });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
