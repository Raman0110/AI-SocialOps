using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Features.Conversations.Infrastructure;

public sealed class MessageAnalysisRepository: IMessageAnalysisRepository
{
    private readonly SocialOpsDbContext _dbContext;

    public MessageAnalysisRepository(SocialOpsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<MessageAnalysis?> GetByMessageIdAsync(Guid messageId, CancellationToken cancellationToken = default)
    {
        return _dbContext.MessageAnalyses
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.MessageId == messageId,
                cancellationToken);
    }

    public async Task AddAsync(MessageAnalysis analysis, CancellationToken cancellationToken = default)
    {
        await _dbContext.MessageAnalyses.AddAsync(analysis, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}