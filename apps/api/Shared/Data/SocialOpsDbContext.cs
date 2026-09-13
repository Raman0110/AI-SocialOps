using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.Organizations.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Shared.Data;

public class SocialOpsDbContext : DbContext
{
    public SocialOpsDbContext(DbContextOptions<SocialOpsDbContext> options): base(options){ }
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<SocialIdentity> SocialIdentities => Set<SocialIdentity>();
    public DbSet<SocialAccount> SocialAccounts => Set<SocialAccount>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

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