var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

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