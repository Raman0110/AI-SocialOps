using System.Text.Json;
using SocialOps.Api.Features.AgentActions.Application.Abstractions;
using SocialOps.Api.Features.AgentActions.Application.CreateTicketProposal;
using SocialOps.Api.Features.Tickets.Domain;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Features.AgentActions.Application.Services.ApproveAgentAction;

public sealed class AgentActionService
{
  private readonly IAgentActionRepository _actionRepository;
  private readonly SocialOpsDbContext _dbContext;

  public AgentActionService(IAgentActionRepository actionRepository, SocialOpsDbContext dbContext)
  {
    _actionRepository = actionRepository;
    _dbContext = dbContext;
  }

  public async Task<Guid?> ApproveAsync(Guid actionId, CancellationToken cancellationToken = default)
  {
    var action = await _actionRepository.GetByIdAsync(actionId, cancellationToken);

    if (action is null || action.Status != AgentActionStatus.Pending) return null;

    if (action.Type != AgentActionType.CreateSupportTicket) throw new InvalidOperationException($"Unsupported action type: {action.Type}");

    var payload = JsonSerializer.Deserialize<CreateTicketProposalPayload>(action.PayloadJson);

    if (payload is null) throw new InvalidOperationException("Invalid agent action payload.");

    var ticket = new SupportTicket
    {
      Id = Guid.NewGuid(),
      OrganizationId = action.OrganizationId,
      ConversationId = action.ConversationId,
      Title = payload.Title,
      Description = payload.Description,
      Priority = payload.Priority,
      Status = TicketStatus.Open
    };

    _dbContext.SupportTickets.Add(ticket);

    action.Status = AgentActionStatus.Approved;
    action.ReviewedAt = DateTime.UtcNow;

    await _dbContext.SaveChangesAsync(cancellationToken);

    return ticket.Id;
  }

  public async Task<bool> RejectAsync(Guid actionId, CancellationToken cancellationToken = default)
  {
    var action = await _actionRepository.GetByIdAsync(actionId, cancellationToken);

    if (action is null || action.Status != AgentActionStatus.Pending) return false;

    action.Status = AgentActionStatus.Rejected;

    action.ReviewedAt = DateTime.UtcNow;

    await _actionRepository.SaveChangesAsync(cancellationToken);

    return true;
  }
}