using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Tests;

public sealed class DevelopmentDataSeederTests
{
    [Fact]
    public async Task SeedAsync_CreatesCompleteDemoAndIsIdempotent()
    {
        var options = new DbContextOptionsBuilder<SocialOpsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var dbContext = new SocialOpsDbContext(options);

        await DevelopmentDataSeeder.SeedAsync(dbContext);
        await DevelopmentDataSeeder.SeedAsync(dbContext);

        Assert.Equal(1, await dbContext.Organizations.CountAsync());
        Assert.Equal(4, await dbContext.Customers.CountAsync());
        Assert.Equal(4, await dbContext.SocialAccounts.CountAsync());
        Assert.Equal(4, await dbContext.Conversations.CountAsync());
        Assert.Equal(14, await dbContext.Messages.CountAsync());
        Assert.Equal(3, await dbContext.KnowledgeEntries.CountAsync());
        Assert.Equal(2, await dbContext.PendingAgentActions.CountAsync());
        Assert.Equal(1, await dbContext.AgentRuns.CountAsync());
        Assert.Equal(1, await dbContext.AgentToolExecutions.CountAsync());
    }
}
