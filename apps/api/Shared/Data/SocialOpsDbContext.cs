using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.AgentRuns.Domain;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.Knowledge.Domain;
using SocialOps.Api.Features.Identity.Domain;
using SocialOps.Api.Features.Organizations.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;
using SocialOps.Api.Features.Tickets.Domain;


namespace SocialOps.Api.Shared.Data;

public class SocialOpsDbContext : DbContext
{
    public SocialOpsDbContext(DbContextOptions<SocialOpsDbContext> options) : base(options) { }
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<SocialIdentity> SocialIdentities => Set<SocialIdentity>();
    public DbSet<SocialAccount> SocialAccounts => Set<SocialAccount>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageAnalysis> MessageAnalyses => Set<MessageAnalysis>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<PendingAgentAction> PendingAgentActions => Set<PendingAgentAction>();
    public DbSet<KnowledgeEntry> KnowledgeEntries => Set<KnowledgeEntry>();
    public DbSet<AgentRun> AgentRuns => Set<AgentRun>();
    public DbSet<AgentToolExecution> AgentToolExecutions => Set<AgentToolExecution>();
    public DbSet<User> Users => Set<User>();
    public DbSet<OrganizationMembership> OrganizationMemberships => Set<OrganizationMembership>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SocialOpsDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var foreignKey in entityType.GetForeignKeys())
            {
                foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
