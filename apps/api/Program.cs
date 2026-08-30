using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.Organizations.Application.Controllers;
using SocialOps.Api.Features.Organizations.Application.CreateOrganization;
using SocialOps.Api.Features.Organizations.Infrastructure;
using SocialOps.Api.Shared.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddControllers();

builder.Services.AddDbContext<SocialOpsDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    options.UseNpgsql(connectionString);
});

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddScoped<IOrganizationRepository,OrganizationRepository>();

builder.Services.AddScoped<CreateOrganizationService>();

builder.Services.AddScoped<OrganizationsController>();

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

app.MapControllers();

app.Run();