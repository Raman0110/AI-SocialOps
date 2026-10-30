using SocialOps.Api.Features.Knowledge.Domain;

namespace SocialOps.Api.Features.Knowledge.Application.Abstractions;

public interface IKnowledgeEntryRepository
{
    Task AddAsync(KnowledgeEntry entry, CancellationToken cancellationToken = default);

    Task<KnowledgeEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<KnowledgeEntry>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default);

    Task<int> CountByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default);

    void Remove(KnowledgeEntry entry);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
