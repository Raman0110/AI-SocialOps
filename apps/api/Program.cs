using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.AgentActions.Application.Abstractions;
using SocialOps.Api.Features.AgentActions.Application.GetPendingActions;
using SocialOps.Api.Features.AgentActions.Application.Services.ApproveAgentAction;
using SocialOps.Api.Features.AgentActions.Application.Services.CreateTicketProposal;
using SocialOps.Api.Features.AgentActions.Infrastructure;
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
using SocialOps.Api.Features.Organizations.Application.Abstractions;
using SocialOps.Api.Features.Organizations.Application.Services;
using SocialOps.Api.Features.Organizations.Infrastructure;
using SocialOps.Api.Features.SocialAccounts.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Application.Services;
using SocialOps.Api.Features.SocialAccounts.Infrastructure;
using SocialOps.Api.Shared.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddControllers();

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

builder.Services.AddHttpClient<AgentClient>(
    client =>
    {
        var baseUrl = builder.Configuration["Agent:BaseUrl"];

        client.BaseAddress = new Uri(baseUrl!);
    });

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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");

app.MapControllers();

app.Run();