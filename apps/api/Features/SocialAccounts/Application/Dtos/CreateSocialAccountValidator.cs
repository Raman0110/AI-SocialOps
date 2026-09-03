using FluentValidation;

namespace SocialOps.Api.Features.SocialAccounts.Application.Dtos;

public sealed class CreateSocialAccountValidator: AbstractValidator<CreateSocialAccountRequest>
{
    public CreateSocialAccountValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty();

        RuleFor(x => x.Platform)
            .IsInEnum();

        RuleFor(x => x.ExternalAccountId)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .MaximumLength(200);
    }
}