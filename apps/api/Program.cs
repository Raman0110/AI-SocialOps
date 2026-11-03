using SocialOps.Api.Shared.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiPresentation();
builder.Services.AddApiAuthentication(builder.Configuration);
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddAgentIntegration(builder.Configuration);
builder.Services.AddOutboundMessaging(builder.Configuration);
builder.Services.AddFrontendCors();

var app = builder.Build();

await app.InitializeDevelopmentDatabaseAsync();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(ApiServiceCollectionExtensions.FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program;
