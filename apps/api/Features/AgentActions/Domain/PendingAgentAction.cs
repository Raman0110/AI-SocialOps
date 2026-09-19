namespace SocialOps.Api.Features.Tickets.Domain;

public enum AgentActionType
{
  CreateSupportTicket = 1
}

public enum AgentActionStatus
{
  Pending = 1,
  Approved = 2,
  Rejected = 3
}
public class PendingAgentAction
{
  public Guid Id { get; set; }

  public Guid OrganizationId { get; set; }

  public Guid ConversationId { get; set; }

  public AgentActionType Type { get; set; }

  public string PayloadJson { get; set; } = null!;

  public AgentActionStatus Status { get; set; } = AgentActionStatus.Pending;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime? ReviewedAt { get; set; }
}