using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.AgentActions.Application.Abstractions;
using SocialOps.Api.Features.Tickets.Domain;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Features.AgentActions.Infrastructure;

public sealed class AgentActionRepository : IAgentActionRepository
{
  private readonly SocialOpsDbContext _dbContext;
  private readonly DbSet<PendingAgentAction> _dbSet;

  public AgentActionRepository(SocialOpsDbContext dbContext)
  {
    _dbContext = dbContext;
    _dbSet = dbContext.Set<PendingAgentAction>();
  }

  public async Task AddAsync(PendingAgentAction action, CancellationToken cancellationToken = default)
  {
    await _dbSet.AddAsync(action, cancellationToken);
  }

  public Task<PendingAgentAction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
  {
    return _dbSet.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
  }

  public async Task<IReadOnlyList<PendingAgentAction>> GetPendingByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default)
  {
    return await _dbSet
        .AsNoTracking()
        .Where(x =>
            x.ConversationId == conversationId &&
            x.Status == AgentActionStatus.Pending)
        .OrderBy(x => x.CreatedAt)
        .ToListAsync(cancellationToken);
  }

  public Task SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    return _dbContext.SaveChangesAsync(cancellationToken);
  }
}
