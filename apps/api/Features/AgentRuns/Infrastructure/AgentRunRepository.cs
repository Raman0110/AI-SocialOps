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

  public Task<AgentRun?> GetByIdAsync(
      Guid id,
      Guid organizationId,
      CancellationToken cancellationToken = default)
  {
    return _dbContext.AgentRuns
        .AsNoTracking()
        .Include(x => x.ToolExecutions)
        .FirstOrDefaultAsync(
            x => x.Id == id && x.OrganizationId == organizationId,
            cancellationToken);
  }

  public async Task<IReadOnlyList<AgentRun>> GetByConversationIdAsync(
      Guid conversationId,
      Guid organizationId,
      int limit,
      CancellationToken cancellationToken = default)
  {
    return await _dbContext.AgentRuns
        .AsNoTracking()
        .Where(x =>
            x.ConversationId == conversationId &&
            x.OrganizationId == organizationId)
        .OrderByDescending(x => x.StartedAt)
        .Take(limit)
        .ToListAsync(cancellationToken);
  }

  public Task SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    return _dbContext.SaveChangesAsync(cancellationToken);
  }
}
