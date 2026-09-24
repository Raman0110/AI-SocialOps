using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.AgentRuns.Domain;

namespace SocialOps.Api.Features.AgentRuns.Infrastructure;

public sealed class AgentToolExecutionConfiguration : IEntityTypeConfiguration<AgentToolExecution>
{
  public void Configure(EntityTypeBuilder<AgentToolExecution> builder)
  {
    builder.ToTable("agent_tool_executions");

    builder.Property(x => x.ToolName)
        .HasMaxLength(200)
        .IsRequired();

    builder.Property(x => x.ArgumentsJson)
        .IsRequired();

    builder.Property(x => x.ResultJson);

    builder.Property(x => x.Error)
        .HasMaxLength(5000);

    builder.HasOne(x => x.AgentRun)
        .WithMany(x => x.ToolExecutions)
        .HasForeignKey(x => x.AgentRunId);
  }
}