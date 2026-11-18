using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using SocialOps.Api.Features.Identity.Application.Dtos;

namespace SocialOps.Api.Tests;

public sealed class AuthenticationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public AuthenticationTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_returns_membership_backed_jwt()
    {
        using var client = await _factory.CreateClientWithKeyAsync(null);

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = ApiFactory.UserEmail,
            password = ApiFactory.UserPassword,
            organizationId = ApiFactory.OrgA
        });

        response.EnsureSuccessStatusCode();
        var session = await response.Content.ReadFromJsonAsync<AuthSessionResponse>();

        Assert.NotNull(session);
        Assert.NotEmpty(session.AccessToken);
        Assert.Equal(ApiFactory.OrgA, session.Organization.Id);
        Assert.Equal("Owner", session.Organization.Role);
        Assert.Contains(session.Memberships, x => x.Id == ApiFactory.OrgA && x.Role == "Owner");
        Assert.Contains(session.Memberships, x => x.Id == ApiFactory.OrgB && x.Role == "Viewer");
    }

    [Fact]
    public async Task Invalid_password_is_unauthorized()
    {
        using var client = await _factory.CreateClientWithKeyAsync(null);

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = ApiFactory.UserEmail,
            password = "wrong-password"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Jwt_cannot_access_another_membership_until_workspace_is_switched()
    {
        using var client = await LoginAsync(ApiFactory.OrgA);

        var forbidden = await client.GetAsync($"/api/conversations/{_factory.ConversationB}");
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);

        var switched = await client.PostAsJsonAsync("/api/auth/switch-organization", new
        {
            organizationId = ApiFactory.OrgB
        });
        switched.EnsureSuccessStatusCode();
        var session = await switched.Content.ReadFromJsonAsync<AuthSessionResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session!.AccessToken);

        var allowed = await client.GetAsync($"/api/conversations/{_factory.ConversationB}");
        Assert.Equal(HttpStatusCode.OK, allowed.StatusCode);

        var operatorRequest = await client.PostAsJsonAsync(
            $"/api/conversations/{_factory.ConversationB}/messages",
            new { direction = "Outbound", senderType = "HumanAgent", content = "test" });
        Assert.Equal(HttpStatusCode.Forbidden, operatorRequest.StatusCode);
    }

    [Fact]
    public async Task User_cannot_switch_to_an_unassigned_organization()
    {
        using var client = await LoginAsync(ApiFactory.OrgA);

        var response = await client.PostAsJsonAsync("/api/auth/switch-organization", new
        {
            organizationId = Guid.NewGuid()
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task User_can_create_a_workspace_and_receives_an_owner_token()
    {
        using var client = await LoginAsync(ApiFactory.OrgA);
        var workspaceName = $"Workspace {Guid.NewGuid():N}";

        var response = await client.PostAsJsonAsync("/api/organizations", new
        {
            name = workspaceName
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var session = await response.Content.ReadFromJsonAsync<AuthSessionResponse>();
        Assert.NotNull(session);
        Assert.Equal(workspaceName, session.Organization.Name);
        Assert.Equal("Owner", session.Organization.Role);
        Assert.Single(session.Memberships, x => x.Id == session.Organization.Id);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", session.AccessToken);
        var currentOrganization = await client.GetAsync($"/api/organizations/{session.Organization.Id}");
        Assert.Equal(HttpStatusCode.OK, currentOrganization.StatusCode);
        var crossTenant = await client.GetAsync($"/api/organizations/{ApiFactory.OrgA}");
        Assert.Equal(HttpStatusCode.Forbidden, crossTenant.StatusCode);
    }

    [Fact]
    public async Task Organization_directory_does_not_accept_machine_api_keys()
    {
        using var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var response = await client.GetAsync("/api/organizations");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Owner_can_create_change_and_remove_membership()
    {
        using var client = await LoginAsync(ApiFactory.OrgA);

        var createdResponse = await client.PostAsJsonAsync("/api/memberships", new
        {
            name = "Support Agent",
            email = "agent@example.com",
            temporaryPassword = "Temporary123!",
            role = "Agent"
        });
        createdResponse.EnsureSuccessStatusCode();
        var created = await createdResponse.Content.ReadFromJsonAsync<MembershipResponse>();

        var updatedResponse = await client.PatchAsJsonAsync(
            $"/api/memberships/{created!.Id}/role",
            new { role = "Viewer" });
        updatedResponse.EnsureSuccessStatusCode();
        var updated = await updatedResponse.Content.ReadFromJsonAsync<MembershipResponse>();
        Assert.Equal("Viewer", updated!.Role);

        var deleted = await client.DeleteAsync($"/api/memberships/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
    }

    [Fact]
    public async Task Changing_a_role_invalidates_the_previous_membership_token()
    {
        using var ownerClient = await LoginAsync(ApiFactory.OrgA);
        var createdResponse = await ownerClient.PostAsJsonAsync("/api/memberships", new
        {
            name = "Versioned Agent",
            email = "versioned-agent@example.com",
            temporaryPassword = "Temporary123!",
            role = "Agent"
        });
        createdResponse.EnsureSuccessStatusCode();
        var membership = await createdResponse.Content.ReadFromJsonAsync<MembershipResponse>();

        using var agentClient = await _factory.CreateClientWithKeyAsync(null);
        var loginResponse = await agentClient.PostAsJsonAsync("/api/auth/login", new
        {
            email = "versioned-agent@example.com",
            password = "Temporary123!",
            organizationId = ApiFactory.OrgA
        });
        loginResponse.EnsureSuccessStatusCode();
        var agentSession = await loginResponse.Content.ReadFromJsonAsync<AuthSessionResponse>();
        agentClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", agentSession!.AccessToken);

        var updated = await ownerClient.PatchAsJsonAsync(
            $"/api/memberships/{membership!.Id}/role",
            new { role = "Viewer" });
        updated.EnsureSuccessStatusCode();

        var staleTokenResponse = await agentClient.GetAsync("/api/conversations");
        Assert.Equal(HttpStatusCode.Unauthorized, staleTokenResponse.StatusCode);
    }

    private async Task<HttpClient> LoginAsync(Guid organizationId)
    {
        var client = await _factory.CreateClientWithKeyAsync(null);
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = ApiFactory.UserEmail,
            password = ApiFactory.UserPassword,
            organizationId
        });
        response.EnsureSuccessStatusCode();
        var session = await response.Content.ReadFromJsonAsync<AuthSessionResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session!.AccessToken);
        return client;
    }
}
