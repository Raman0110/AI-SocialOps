using SocialOps.Api.Features.Knowledge.Application.Abstractions;
using SocialOps.Api.Features.Knowledge.Application.Dtos;
using SocialOps.Api.Features.Knowledge.Domain;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.Knowledge.Application.Services;

public sealed class KnowledgeService
{
    private const int MaxSearchResults = 5;
    private const int MinTermLength = 3;

    private static readonly char[] TermSeparators =
        [' ', '\t', '\r', '\n', ',', '.', ';', ':', '!', '?', '"', '(', ')', '-', '/'];

    private readonly IKnowledgeEntryRepository _repository;

    public KnowledgeService(IKnowledgeEntryRepository repository)
    {
        _repository = repository;
    }

    public async Task<KnowledgeEntryResponse> CreateAsync(
        Guid organizationId,
        CreateKnowledgeEntryRequest request,
        CancellationToken cancellationToken = default)
    {
        var count = await _repository.CountByOrganizationIdAsync(organizationId, cancellationToken);

        if (count >= KnowledgeLimits.MaxEntriesPerOrganization)
        {
            throw new BusinessRuleException(
                $"An organization can store at most {KnowledgeLimits.MaxEntriesPerOrganization} knowledge entries.");
        }

        var entry = new KnowledgeEntry
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(entry, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return ToResponse(entry);
    }

    public async Task<IReadOnlyList<KnowledgeEntryResponse>> GetAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        var entries = await _repository.GetByOrganizationIdAsync(organizationId, cancellationToken);

        return entries.Select(ToResponse).ToList();
    }

    public async Task<bool> DeleteAsync(
        Guid organizationId,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entry = await _repository.GetByIdAsync(id, cancellationToken);

        if (entry is null || entry.OrganizationId != organizationId) return false;

        _repository.Remove(entry);
        await _repository.SaveChangesAsync(cancellationToken);

        return true;
    }

    // Knowledge bases are small (capped per organization), so entries are scored in
    // memory: each query term found in the title counts triple, in the content once.
    public async Task<SearchKnowledgeResponse> SearchAsync(
        Guid organizationId,
        string query,
        CancellationToken cancellationToken = default)
    {
        var terms = query
            .ToLowerInvariant()
            .Split(TermSeparators, StringSplitOptions.RemoveEmptyEntries)
            .Where(x => x.Length >= MinTermLength)
            .Distinct()
            .ToList();

        if (terms.Count == 0) return new SearchKnowledgeResponse([]);

        var entries = await _repository.GetByOrganizationIdAsync(organizationId, cancellationToken);

        var results = entries
            .Select(entry => (Entry: entry, Score: Score(entry, terms)))
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Entry.Title)
            .Take(MaxSearchResults)
            .Select(x => new KnowledgeSearchResult(x.Entry.Id, x.Entry.Title, x.Entry.Content))
            .ToList();

        return new SearchKnowledgeResponse(results);
    }

    private static int Score(KnowledgeEntry entry, List<string> terms)
    {
        var title = entry.Title.ToLowerInvariant();
        var content = entry.Content.ToLowerInvariant();
        var score = 0;

        foreach (var term in terms)
        {
            if (title.Contains(term)) score += 3;
            if (content.Contains(term)) score += 1;
        }

        return score;
    }

    private static KnowledgeEntryResponse ToResponse(KnowledgeEntry entry)
    {
        return new KnowledgeEntryResponse(entry.Id, entry.Title, entry.Content, entry.CreatedAt);
    }
}
