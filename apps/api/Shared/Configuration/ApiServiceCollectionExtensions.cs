using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.IdentityModel.Tokens;
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
using SocialOps.Api.Features.Identity.Application.Services;
using SocialOps.Api.Features.Identity.Domain;
using SocialOps.Api.Features.DevelopmentData.Application.Services;
using SocialOps.Api.Features.InboundWebhooks.Application.Abstractions;
using SocialOps.Api.Features.Knowledge.Application.Abstractions;
using SocialOps.Api.Features.OutboundMessages.Application.Abstractions;
using SocialOps.Api.Features.OutboundMessages.Application.Services;
using SocialOps.Api.Features.OutboundMessages.Infrastructure;
using SocialOps.Api.Shared.Integrations;
using SocialOps.Api.Features.Knowledge.Application.Services;
using SocialOps.Api.Features.Knowledge.Infrastructure;
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

namespace SocialOps.Api.Shared.Configuration;

public static class ApiServiceCollectionExtensions
{
    public const string FrontendCorsPolicy = "Frontend";

    public static IServiceCollection AddApiPresentation(this IServiceCollection services)
    {
        services.AddOpenApi();
        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services
            .AddControllers()
            .AddJsonOptions(options =>
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddHttpContextAccessor();

        return services;
    }

    public static IServiceCollection AddApiAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        const string compositeScheme = "SocialOps";
        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();

        if (Encoding.UTF8.GetByteCount(jwtOptions.SigningKey) < 32)
        {
            throw new InvalidOperationException(
                "Authentication:Jwt:SigningKey must contain at least 32 bytes.");
        }

        if (jwtOptions.AccessTokenMinutes is < 5 or > 1440)
        {
            throw new InvalidOperationException(
                "Authentication:Jwt:AccessTokenMinutes must be between 5 and 1440.");
        }

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = compositeScheme;
                options.DefaultChallengeScheme = compositeScheme;
            })
            .AddPolicyScheme(compositeScheme, compositeScheme, options =>
            {
                options.ForwardDefaultSelector = context =>
                    context.Request.Headers.ContainsKey("X-Api-Key")
                        ? ApiKeyAuthenticationOptions.Scheme
                        : JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = ClaimTypes.Name,
                    RoleClaimType = ClaimTypes.Role
                };
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var principal = context.Principal;
                        var membershipValue = principal?.FindFirstValue(SocialOpsClaimTypes.MembershipId);
                        var versionValue = principal?.FindFirstValue(SocialOpsClaimTypes.MembershipVersion);
                        var organizationValue = principal?.FindFirstValue(SocialOpsClaimTypes.OrganizationId);
                        var roleValue = principal?.FindFirstValue(ClaimTypes.Role);

                        if (!Guid.TryParse(membershipValue, out var membershipId) ||
                            !int.TryParse(versionValue, out var membershipVersion) ||
                            !Guid.TryParse(organizationValue, out var organizationId) ||
                            !Enum.TryParse<MembershipRole>(roleValue, out var membershipRole))
                        {
                            context.Fail("The membership claims are invalid.");
                            return;
                        }

                        var dbContext = context.HttpContext.RequestServices
                            .GetRequiredService<SocialOpsDbContext>();
                        var membershipIsCurrent = await dbContext.OrganizationMemberships.AnyAsync(
                            x => x.Id == membershipId &&
                                 x.OrganizationId == organizationId &&
                                 x.Version == membershipVersion &&
                                 x.Role == membershipRole &&
                                 x.User.IsActive,
                            context.HttpContext.RequestAborted);

                        if (!membershipIsCurrent)
                        {
                            context.Fail("The membership is no longer active.");
                        }
                    }
                };
            })
            .AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>
            (ApiKeyAuthenticationOptions.Scheme, options => configuration.GetSection("Authentication:ApiKey").Bind(options));

        services.AddAuthorization(options =>
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

        return services;
    }

    public static IServiceCollection AddPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is required.");

        services.AddDbContext<SocialOpsDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ISocialAccountRepository, SocialAccountRepository>();
        services.AddScoped<IKnowledgeEntryRepository, KnowledgeEntryRepository>();
        services.AddScoped<ISocialIdentityRepository, SocialIdentityRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IMessageAnalysisRepository, MessageAnalysisRepository>();
        services.AddScoped<IAgentActionRepository, AgentActionRepository>();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<SocialOpsDbContext>();
        services.AddScoped<AnalyzeConversationService>();
        services.AddScoped<ConversationsService>();
        services.AddScoped<MessageService>();
        services.AddScoped<OrganizationService>();
        services.AddScoped<CustomerService>();
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<JwtTokenService>();
        services.AddScoped<AuthService>();
        services.AddScoped<MembershipService>();
        services.AddScoped<DevelopmentDataResetService>();
        services.AddScoped<SocialAccountService>();
        services.AddScoped<KnowledgeService>();
        services.AddScoped<SocialIdentityService>();
        services.AddScoped<SuggestReplyService>();
        services.AddScoped<GetCustomerContextService>();
        services.AddScoped<GenerateAgentReplyService>();
        services.AddScoped<GetConversationHistoryService>();
        services.AddScoped<CreateTicketProposalService>();
        services.AddScoped<AgentActionService>();
        services.AddScoped<GetPendingAgentActionsService>();
        services.AddScoped<IAgentRunRepository, AgentRunRepository>();
        services.AddScoped<GetAgentRunsService>();
        services.AddScoped<InboundWebhookIngestionService>();
        services.AddScoped<
            IInboundWebhookAdapter<SandboxInstagramWebhookRequest>,
            SandboxInstagramWebhookAdapter>();
        services.AddScoped<ITenantContext, HeaderTenantContext>();

        return services;
    }

    public static IServiceCollection AddAgentIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        var settings = AgentHttpClientSettings.FromConfiguration(configuration);

        void ConfigureClient(HttpClient client)
        {
            client.BaseAddress = settings.BaseUrl;
            client.Timeout = settings.Timeout;
        }

        services
            .AddHttpClient(AgentClient.RetrySafeClientName, ConfigureClient)
            .AddResilienceHandler("agent-retry", resilienceBuilder =>
            {
                resilienceBuilder.AddRetry(new HttpRetryStrategyOptions
                {
                    MaxRetryAttempts = settings.RetryAttempts,
                    Delay = settings.RetryDelay,
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

        services.AddHttpClient(AgentClient.SingleAttemptClientName, ConfigureClient);
        services.AddScoped<AgentClient>();
        services.AddScoped<AnalyzeMessageService>();

        return services;
    }

    public static IServiceCollection AddOutboundMessaging(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<OutboundMessageDispatcher>();
        services.Configure<InstagramOptions>(configuration.GetSection(InstagramOptions.SectionName));

        var instagram = configuration.GetSection(InstagramOptions.SectionName).Get<InstagramOptions>() ?? new InstagramOptions();

        if (instagram.SendingConfigured)
        {
            services.AddHttpClient(InstagramOutboundSender.HttpClientName, client => client.Timeout = TimeSpan.FromSeconds(15));
            services.AddSingleton<IOutboundMessageSender, InstagramOutboundSender>();
        }
        // The sandbox sender is off unless explicitly enabled, and never used alongside a real
        // sender, so an unconfigured deployment records replies as Failed instead of reporting
        // messages as sent that were never delivered.
        else if (configuration.GetValue<bool>("Outbound:UseSandbox"))
        {
            services.AddSingleton<IOutboundMessageSender, SandboxInstagramOutboundSender>();
        }

        return services;
    }

    public static IServiceCollection AddFrontendCors(this IServiceCollection services, IConfiguration configuration)
    {
        // Comma-separated list in Cors:AllowedOrigins; defaults to the Vite dev server.
        var origins = (configuration["Cors:AllowedOrigins"] ?? "http://localhost:5173")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        services.AddCors(options =>
        {
            options.AddPolicy(FrontendCorsPolicy, policy =>
            {
                policy
                    .WithOrigins(origins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }

    private sealed record AgentHttpClientSettings(
        Uri BaseUrl,
        TimeSpan Timeout,
        int RetryAttempts,
        TimeSpan RetryDelay)
    {
        public static AgentHttpClientSettings FromConfiguration(IConfiguration configuration)
        {
            var baseUrl = configuration["Agent:BaseUrl"] ?? throw new InvalidOperationException("Agent:BaseUrl is required.");
            var timeoutSeconds = configuration.GetValue<int?>("Agent:TimeoutSeconds") ?? 30;
            var retryAttempts = configuration.GetValue<int?>("Agent:Retry:MaxAttempts") ?? 2;
            var retryDelayMilliseconds =
                configuration.GetValue<int?>("Agent:Retry:BaseDelayMilliseconds") ?? 250;

            if (timeoutSeconds <= 0)
            {
                throw new InvalidOperationException(
                    "Agent:TimeoutSeconds must be greater than zero.");
            }

            if (retryAttempts is < 0 or > 5)
            {
                throw new InvalidOperationException(
                    "Agent:Retry:MaxAttempts must be between zero and five.");
            }

            if (retryDelayMilliseconds < 0)
            {
                throw new InvalidOperationException(
                    "Agent:Retry:BaseDelayMilliseconds cannot be negative.");
            }

            return new AgentHttpClientSettings(
                new Uri(baseUrl),
                TimeSpan.FromSeconds(timeoutSeconds),
                retryAttempts,
                TimeSpan.FromMilliseconds(retryDelayMilliseconds));
        }
    }
}
