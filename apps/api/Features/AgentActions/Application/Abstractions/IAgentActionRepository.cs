
using SocialOps.Api.Features.Tickets.Domain;

namespace SocialOps.Api.Features.AgentActions.Application.Abstractions;

public interface IAgentActionRepository
{
  Task AddAsync(PendingAgentAction action, CancellationToken cancellationToken = default);

  Task<PendingAgentAction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

  Task<IReadOnlyList<PendingAgentAction>> GetPendingByConversationIdAsync(
    Guid conversationId,
    Guid organizationId,
    CancellationToken cancellationToken = default);

  Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
