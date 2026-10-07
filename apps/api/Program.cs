using System.Net;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Http.Resilience;
using Polly;
using SocialOps.Api.Features.AgentActions.Application.Abstractions;
using SocialOps.Api.Features.AgentActions.Application.GetPendingActions;
using SocialOps.Api.Features.AgentActions.Application.Services.ApproveAgentAction;
using SocialOps.Api.Features.AgentActions.Application.Services.CreateTicketProposal;
using SocialOps.Api.Features.AgentActions.Infrastructure;
using SocialOps.Api.Features.AgentRuns.Application.Abstractions;
using SocialOps.Api.Features.AgentRuns.Application.Services;
using SocialOps.Api.Features.AgentRuns.Infrastructure;
using SocialOps.Api.Features.AI.Application.AnalyzeMessage.Services;
using SocialOps.Api.Features.AI.Infrastructure;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.GenerateAgentReply;
using SocialOps.Api.Features.Conversations.Application.Services;
using SocialOps.Api.Features.Conversations.Application.Services.AnalyzeConversation;
using SocialOps.Api.Features.Conversations.Application.Services.GetCustomerContext;
using SocialOps.Api.Features.Conversations.Application.Services.SuggestReplyService;
using SocialOps.Api.Features.Conversations.Infrastructure;
using SocialOps.Api.Features.Customers.Application.Abstraction;
using SocialOps.Api.Features.Customers.Application.Abstractions;
using SocialOps.Api.Features.Customers.Application.Services;
using SocialOps.Api.Features.Customers.Infrastructure;
using SocialOps.Api.Features.InboundWebhooks.Application.Abstractions;
using SocialOps.Api.Features.InboundWebhooks.Application.Dtos;
using SocialOps.Api.Features.InboundWebhooks.Application.Services;
using SocialOps.Api.Features.InboundWebhooks.Infrastructure;
using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.Organizations.Application.Services;
using SocialOps.Api.Features.Organizations.Infrastructure;
using SocialOps.Api.Features.SocialAccounts.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Application.Services;
using SocialOps.Api.Features.SocialAccounts.Infrastructure;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Data;
using SocialOps.Api.Shared.Errors;
using SocialOps.Api.Shared.Tenancy;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddControllers();

builder.Services.AddHttpContextAccessor();

builder.Services
    .AddAuthentication(ApiKeyAuthenticationOptions.Scheme)
    .AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>(
        ApiKeyAuthenticationOptions.Scheme,
        options => builder.Configuration
            .GetSection("Authentication:ApiKey")
            .Bind(options));

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(
        SocialOpsPolicies.TenantReader,
        policy => policy
            .RequireAuthenticatedUser()
            .RequireRole(SocialOpsRoles.TenantReaders));

    options.AddPolicy(
        SocialOpsPolicies.TenantOperator,
        policy => policy
            .RequireAuthenticatedUser()
            .RequireRole(SocialOpsRoles.TenantOperators));

    options.AddPolicy(
        SocialOpsPolicies.TenantAdmin,
        policy => policy
            .RequireAuthenticatedUser()
            .RequireRole(SocialOpsRoles.TenantAdmins));
});

builder.Services.AddDbContext<SocialOpsDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    options.UseNpgsql(connectionString);
});

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();

builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

builder.Services.AddScoped<ISocialAccountRepository, SocialAccountRepository>();

builder.Services.AddScoped<ISocialIdentityRepository, SocialIdentityRepository>();

builder.Services.AddScoped<IConversationRepository, ConversationRepository>();

builder.Services.AddScoped<IMessageRepository, MessageRepository>();

builder.Services.AddScoped<IMessageAnalysisRepository, MessageAnalysisRepository>();

builder.Services.AddScoped<IAgentActionRepository, AgentActionRepository>();

builder.Services.AddScoped<AnalyzeConversationService>();

builder.Services.AddScoped<ConversationsService>();

builder.Services.AddScoped<MessageService>();

builder.Services.AddScoped<OrganizationService>();

builder.Services.AddScoped<CustomerService>();

builder.Services.AddScoped<SocialAccountService>();

builder.Services.AddScoped<SocialIdentityService>();

builder.Services.AddScoped<SuggestReplyService>();

builder.Services.AddScoped<GetCustomerContextService>();

builder.Services.AddScoped<GenerateAgentReplyService>();

builder.Services.AddScoped<GetConversationHistoryService>();

builder.Services.AddScoped<CreateTicketProposalService>();

builder.Services.AddScoped<AgentActionService>();

builder.Services.AddScoped<GetPendingAgentActionsService>();

builder.Services.AddScoped<IAgentRunRepository, AgentRunRepository>();

builder.Services.AddScoped<GetAgentRunsService>();

builder.Services.AddScoped<InboundWebhookIngestionService>();

builder.Services.AddScoped<IInboundWebhookAdapter<SandboxInstagramWebhookRequest>, SandboxInstagramWebhookAdapter>();

builder.Services.AddScoped<ITenantContext, HeaderTenantContext>();

var agentBaseUrl = builder.Configuration["Agent:BaseUrl"]
    ?? throw new InvalidOperationException("Agent:BaseUrl is required.");
var agentTimeoutSeconds = builder.Configuration.GetValue<int?>("Agent:TimeoutSeconds") ?? 30;
var agentRetryAttempts = builder.Configuration.GetValue<int?>("Agent:Retry:MaxAttempts") ?? 2;
var agentRetryDelayMilliseconds = builder.Configuration.GetValue<int?>("Agent:Retry:BaseDelayMilliseconds") ?? 250;

if (agentTimeoutSeconds <= 0)
{
    throw new InvalidOperationException("Agent:TimeoutSeconds must be greater than zero.");
}

if (agentRetryAttempts is < 0 or > 5)
{
    throw new InvalidOperationException("Agent:Retry:MaxAttempts must be between zero and five.");
}

if (agentRetryDelayMilliseconds < 0)
{
    throw new InvalidOperationException("Agent:Retry:BaseDelayMilliseconds cannot be negative.");
}

void ConfigureAgentHttpClient(HttpClient client)
{
    client.BaseAddress = new Uri(agentBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(agentTimeoutSeconds);
}

builder.Services
    .AddHttpClient(AgentClient.RetrySafeClientName, ConfigureAgentHttpClient)
    .AddResilienceHandler("agent-retry", resilienceBuilder =>
    {
        resilienceBuilder.AddRetry(new HttpRetryStrategyOptions
        {
            MaxRetryAttempts = agentRetryAttempts,
            Delay = TimeSpan.FromMilliseconds(agentRetryDelayMilliseconds),
            BackoffType = DelayBackoffType.Exponential,
            UseJitter = true,
            ShouldRetryAfterHeader = true,
            ShouldHandle = static arguments =>
            {
                var statusCode = arguments.Outcome.Result?.StatusCode;
                var shouldRetry =
                    arguments.Outcome.Exception is HttpRequestException ||
                    statusCode is HttpStatusCode.TooManyRequests or
                        HttpStatusCode.BadGateway or
                        HttpStatusCode.ServiceUnavailable;

                return ValueTask.FromResult(shouldRetry);
            }
        });
    });

builder.Services.AddHttpClient(
    AgentClient.SingleAttemptClientName,
    ConfigureAgentHttpClient);

builder.Services.AddScoped<AgentClient>();

builder.Services.AddScoped<AnalyzeMessageService>();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
