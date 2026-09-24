namespace SocialOps.Api.Features.AgentRuns.Domain;

public enum AgentRunStatus
{
  Running = 1,
  Completed = 2,
  Failed = 3
}
public class AgentRun
{
  public Guid Id { get; set; }

  public Guid OrganizationId { get; set; }

  public Guid ConversationId { get; set; }

  public Guid InputMessageId { get; set; }

  public AgentRunStatus Status { get; set; }

  public string? Model { get; set; }

  public string? FinalReply { get; set; }

  public string? Error { get; set; }

  public DateTime StartedAt { get; set; }
      = DateTime.UtcNow;

  public DateTime? CompletedAt { get; set; }

  public ICollection<AgentToolExecution> ToolExecutions { get; set; } = new List<AgentToolExecution>();
}