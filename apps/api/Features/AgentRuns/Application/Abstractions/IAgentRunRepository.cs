using SocialOps.Api.Features.AgentRuns.Domain;

namespace SocialOps.Api.Features.AgentRuns.Application.Abstractions;

public interface IAgentRunRepository
{
  Task AddAsync(AgentRun run, CancellationToken cancellationToken = default);

  Task<AgentRun?> GetTrackedByIdAsync(Guid id, CancellationToken cancellationToken = default);

  Task SaveChangesAsync(CancellationToken cancellationToken = default);
}