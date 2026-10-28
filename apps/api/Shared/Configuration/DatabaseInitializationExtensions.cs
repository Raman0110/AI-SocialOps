using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Shared.Configuration;

public static class DatabaseInitializationExtensions
{
    public static async Task InitializeDevelopmentDatabaseAsync(
        this WebApplication app,
        CancellationToken cancellationToken = default)
    {
        if (!app.Environment.IsDevelopment())
        {
            return;
        }

        await using var scope = app.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<SocialOpsDbContext>();

        await dbContext.Database.MigrateAsync(cancellationToken);

        if (app.Configuration.GetValue<bool>("Database:SeedDevelopmentData"))
        {
            await DevelopmentDataSeeder.SeedAsync(dbContext, cancellationToken);
        }
    }
}
