using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.AgentRuns.Application.Abstractions;
using SocialOps.Api.Features.AgentRuns.Domain;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Features.AgentRuns.Infrastructure;

public sealed class AgentRunRepository : IAgentRunRepository
{
  private readonly SocialOpsDbContext _dbContext;

  public AgentRunRepository(SocialOpsDbContext dbContext)
  {
    _dbContext = dbContext;
  }

  public async Task AddAsync(AgentRun run, CancellationToken cancellationToken = default)
  {
    await _dbContext.AgentRuns.AddAsync(run, cancellationToken);
  }

  public Task<AgentRun?> GetTrackedByIdAsync(Guid id, CancellationToken cancellationToken = default)
  {
    return _dbContext.AgentRuns
        .Include(x => x.ToolExecutions)
        .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
  }

  public Task SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    return _dbContext.SaveChangesAsync(cancellationToken);
  }
}