using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Abstractions
{
    public interface IConversationRepository
    {
        Task AddAsync(Conversation conversation, CancellationToken cancellationToken = default);

        Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Conversation>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default);

        Task<Conversation?> GetExistingAsync(
            Guid socialAccountId,
            Guid socialIdentityId,
            string? externalConversationId,
            CancellationToken cancellationToken = default);

        Task SaveChangesAsync(CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Conversation>> GetInboxAsync(Guid organizationId, CancellationToken cancellationToken = default);
    }
}
