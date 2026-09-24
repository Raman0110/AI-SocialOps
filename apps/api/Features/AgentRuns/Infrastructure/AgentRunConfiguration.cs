using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.AgentRuns.Domain;

namespace SocialOps.Api.Features.AgentRuns.Infrastructure;

public sealed class AgentRunConfiguration : IEntityTypeConfiguration<AgentRun>
{
  public void Configure(EntityTypeBuilder<AgentRun> builder)
  {
    builder.ToTable("agent_runs");

    builder.Property(x => x.Status)
        .HasConversion<string>()
        .HasMaxLength(50);

    builder.Property(x => x.Model)
        .HasMaxLength(200);

    builder.Property(x => x.FinalReply)
        .HasMaxLength(10000);

    builder.Property(x => x.Error)
        .HasMaxLength(5000);

    builder.HasIndex(x => new
    {
      x.ConversationId,
      x.StartedAt
    });
  }
}