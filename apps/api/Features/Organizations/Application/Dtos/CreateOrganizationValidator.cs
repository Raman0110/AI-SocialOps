using FluentValidation;

namespace SocialOps.Api.Features.Organizations.Application.CreateOrganization;

public sealed class CreateOrganizationValidator: AbstractValidator<CreateOrganizationRequest>
{
    public CreateOrganizationValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Organization name is required.")
            .MaximumLength(200)
            .WithMessage("Organization name must not exceed 200 characters.");
    }
}