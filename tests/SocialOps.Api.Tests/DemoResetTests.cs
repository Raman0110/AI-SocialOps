using System.Net;

namespace SocialOps.Api.Tests;

public sealed class DemoResetTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public DemoResetTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Reset_IsNotExposedOutsideDevelopment()
    {
        using var client = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyA);

        var response = await client.PostAsync("/api/demo/reset", content: null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
