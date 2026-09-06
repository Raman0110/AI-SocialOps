using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Shared.Persistence;

namespace SocialOps.Api.Features.Conversations.Infrastructure
{
    public class ConversationRepository:IConversationRepository
    {
        private readonly SocialOpsDbContext _dbContext;
        private readonly DbSet<Conversation> _dbSet;

        public ConversationRepository(SocialOpsDbContext dbContext)
        {
            _dbContext = dbContext;
            _dbSet = dbContext.Set<Conversation>();
        }

        public async Task AddAsync(Conversation conversation, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(conversation, cancellationToken);
        }

        public async Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(x => x.Customer)
                .Include(x => x.SocialIdentity)
                .Include(x => x.SocialAccount)
                .Include(x => x.Messages)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<IReadOnlyList<Conversation>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(x => x.OrganizationId == organizationId)
                .Include(x => x.Customer)
                .Include(x => x.SocialIdentity)
                .Include(x => x.SocialAccount)
                .OrderByDescending(x => x.LastMessageAt ?? x.CreatedAt)
                .ToListAsync(cancellationToken);
        }
        public Task<Conversation?> GetExistingAsync(
            Guid socialAccountId,
            Guid socialIdentityId,
            string? externalConversationId,
            CancellationToken cancellationToken = default)
        {
            return _dbSet
                .FirstOrDefaultAsync(
                    x =>
                        x.SocialAccountId == socialAccountId &&
                        x.SocialIdentityId == socialIdentityId &&
                        x.ExternalConversationId == externalConversationId,
                    cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
