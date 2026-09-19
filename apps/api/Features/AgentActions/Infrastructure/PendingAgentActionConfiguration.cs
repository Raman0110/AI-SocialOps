using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Tickets.Domain;

namespace SocialOps.Api.Features.AgentActions.Infrastructure;

public sealed class PendingAgentActionConfiguration : IEntityTypeConfiguration<PendingAgentAction>
{
  public void Configure(EntityTypeBuilder<PendingAgentAction> builder)
  {
    builder.ToTable("pending_agent_actions");

    builder.Property(x => x.Type)
        .HasConversion<string>()
        .HasMaxLength(100);

    builder.Property(x => x.Status)
        .HasConversion<string>()
        .HasMaxLength(50);

    builder.Property(x => x.PayloadJson)
        .IsRequired();

    builder.HasIndex(x => new
    {
      x.ConversationId,
      x.Status
    });
  }
}