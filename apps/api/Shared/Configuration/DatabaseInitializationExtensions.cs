using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Shared.Configuration;

public static class DatabaseInitializationExtensions
{
    public static async Task InitializeDevelopmentDatabaseAsync(
        this WebApplication app,
        CancellationToken cancellationToken = default)
    {
        // Development always migrates. Elsewhere it is opt-in (Database:MigrateOnStartup) so a
        // single-instance deployment can migrate itself; sample data is only ever seeded in Development.
        var isDevelopment = app.Environment.IsDevelopment();

        if (!isDevelopment && !app.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
        {
            return;
        }

        await using var scope = app.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<SocialOpsDbContext>();

        await dbContext.Database.MigrateAsync(cancellationToken);

        if (isDevelopment && app.Configuration.GetValue<bool>("Database:SeedDevelopmentData"))
        {
            await DevelopmentDataSeeder.SeedAsync(dbContext, cancellationToken);
        }
    }
}
