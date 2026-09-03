using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Customers.Application.Abstractions;
using SocialOps.Api.Features.Customers.Application.Services;
using SocialOps.Api.Features.Customers.Infrastructure;
using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.Organizations.Application.Services;
using SocialOps.Api.Features.Organizations.Infrastructure;
using SocialOps.Api.Features.SocialAccounts.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Application.Services;
using SocialOps.Api.Features.SocialAccounts.Infrastructure;
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

builder.Services.AddScoped<ICustomerRepository,CustomerRepository>();

builder.Services.AddScoped<ISocialAccountRepository, SocialAccountRepository>();

builder.Services.AddScoped<OrganizationService>();

builder.Services.AddScoped<CustomerService>();

builder.Services.AddScoped<SocialAccountService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();