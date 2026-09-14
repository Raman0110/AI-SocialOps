using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Abstractions;

public interface IMessageAnalysisRepository
{
    Task<MessageAnalysis?> GetByMessageIdAsync(
        Guid messageId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        MessageAnalysis analysis,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}