using FluentValidation;

namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed class AddMessageValidator: AbstractValidator<AddMessageRequest>
{
    public AddMessageValidator()
    {
        RuleFor(x => x.Direction)
            .IsInEnum();

        RuleFor(x => x.SenderType)
            .IsInEnum();

        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(10000);

        RuleFor(x => x.ExternalMessageId)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.ExternalMessageId));
    }
}