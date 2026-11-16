using System.Net;

namespace SocialOps.Api.Tests;

public sealed class DevelopmentDataResetTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public DevelopmentDataResetTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Reset_IsNotExposedOutsideDevelopment()
    {
        using var client = await _factory.CreateClientWithKeyAsync(ApiFactory.AdminKeyA);

        var response = await client.PostAsync("/api/development-data/reset", content: null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
