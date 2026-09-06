using FluentValidation;
using SocialOps.Api.Features.Conversations.Application.Dtos;

namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed class CreateConversationValidator: AbstractValidator<CreateConversationRequest>
{
    public CreateConversationValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty();

        RuleFor(x => x.CustomerId)
            .NotEmpty();

        RuleFor(x => x.SocialIdentityId)
            .NotEmpty();

        RuleFor(x => x.SocialAccountId)
            .NotEmpty();

        RuleFor(x => x.ExternalConversationId)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.ExternalConversationId));
    }
}