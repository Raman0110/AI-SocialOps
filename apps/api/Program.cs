using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Shared.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<SocialOpsDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    options.UseNpgsql(connectionString);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        service = "socialops-api",
        status = "healthy",
        timestamp = DateTime.UtcNow
    });
});

app.Run();