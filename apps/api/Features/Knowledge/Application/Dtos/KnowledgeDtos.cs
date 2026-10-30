using FluentValidation;
using SocialOps.Api.Features.Knowledge.Domain;

namespace SocialOps.Api.Features.Knowledge.Application.Dtos;

public sealed record CreateKnowledgeEntryRequest(
    string Title,
    string Content
);

public sealed record KnowledgeEntryResponse(
    Guid Id,
    string Title,
    string Content,
    DateTime CreatedAt
);

public sealed record SearchKnowledgeResponse(
    IReadOnlyList<KnowledgeSearchResult> Results
);

public sealed record KnowledgeSearchResult(
    Guid Id,
    string Title,
    string Content
);

public sealed class CreateKnowledgeEntryValidator : AbstractValidator<CreateKnowledgeEntryRequest>
{
    public CreateKnowledgeEntryValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(KnowledgeLimits.TitleMaxLength);

        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(KnowledgeLimits.ContentMaxLength);
    }
}
