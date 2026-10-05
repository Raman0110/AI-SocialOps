using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Abstractions;

public interface IMessageRepository
{
    Task AddAsync(Message message, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Message>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);

    Task<Message?> GetByExternalMessageIdAsync(string externalMessageId, CancellationToken cancellationToken = default);

    Task<bool> ExistsByExternalMessageIdAsync(string externalMessageId, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<Message?> GetLatestInboundAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
