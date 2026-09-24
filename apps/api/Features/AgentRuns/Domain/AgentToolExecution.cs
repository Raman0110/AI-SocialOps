namespace SocialOps.Api.Features.AgentRuns.Domain;

public class AgentToolExecution
{
  public Guid Id { get; set; }

  public Guid AgentRunId { get; set; }

  public string ToolName { get; set; } = null!;

  public string ArgumentsJson { get; set; } = null!;

  public string? ResultJson { get; set; }

  public bool Success { get; set; }

  public string? Error { get; set; }

  public DateTime StartedAt { get; set; }
      = DateTime.UtcNow;

  public DateTime? CompletedAt { get; set; }

  public AgentRun AgentRun { get; set; } = null!;
}