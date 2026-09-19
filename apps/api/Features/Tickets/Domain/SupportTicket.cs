namespace SocialOps.Api.Features.Tickets.Domain;


public enum TicketPriority
{
  Low = 1,
  Normal = 2,
  High = 3,
  Urgent = 4
}

public enum TicketStatus
{
  Open = 1,
  InProgress = 2,
  Resolved = 3,
  Closed = 4
}
public class SupportTicket
{
  public Guid Id { get; set; }

  public Guid OrganizationId { get; set; }

  public Guid ConversationId { get; set; }

  public string Title { get; set; } = null!;

  public string Description { get; set; } = null!;

  public TicketPriority Priority { get; set; }

  public TicketStatus Status { get; set; } = TicketStatus.Open;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}