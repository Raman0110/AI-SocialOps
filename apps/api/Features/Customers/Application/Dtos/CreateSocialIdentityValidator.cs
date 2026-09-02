using FluentValidation;

namespace SocialOps.Api.Features.Customers.Application.Dtos.CreateSocialIdentity;

public sealed class CreateSocialIdentityValidator: AbstractValidator<CreateSocialIdentityRequest>
{
    public CreateSocialIdentityValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty();

        RuleFor(x => x.Platform)
            .IsInEnum();

        RuleFor(x => x.ExternalUserId)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Username)
            .NotEmpty()
            .MaximumLength(200);
    }
}