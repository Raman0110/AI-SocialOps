using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Features.Conversations.Infrastructure;

public sealed class MessageRepository: IMessageRepository
{
    private readonly SocialOpsDbContext _dbContext;
    private readonly DbSet<Message> _dbSet;

    public MessageRepository(SocialOpsDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<Message>();
    }

    public async Task AddAsync(
        Message message,
        CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(
            message,
            cancellationToken);
    }

    public async Task<IReadOnlyList<Message>> GetByConversationIdAsync(
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(x => x.ConversationId == conversationId)
            .OrderBy(x => x.SentAt)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsByExternalMessageIdAsync(
        string externalMessageId,
        CancellationToken cancellationToken = default)
    {
        return _dbSet
                .AnyAsync(
                x => x.ExternalMessageId == externalMessageId,
                cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<Message?> GetLatestInboundAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Messages
            .AsNoTracking()
            .Where(x =>
                x.ConversationId == conversationId &&
                x.Direction == MessageDirection.Inbound)
            .OrderByDescending(x => x.SentAt)
            .FirstOrDefaultAsync(cancellationToken);
    }
}