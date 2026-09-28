using SocialOps.Api.Features.AgentRuns.Domain;

namespace SocialOps.Api.Features.AgentRuns.Application.Abstractions;

public interface IAgentRunRepository
{
  Task AddAsync(AgentRun run, CancellationToken cancellationToken = default);

  Task<AgentRun?> GetByIdAsync(
      Guid id,
      Guid organizationId,
      CancellationToken cancellationToken = default);

  Task<IReadOnlyList<AgentRun>> GetByConversationIdAsync(
      Guid conversationId,
      Guid organizationId,
      int limit,
      CancellationToken cancellationToken = default);

  Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
