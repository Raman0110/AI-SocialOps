using FluentValidation;

namespace SocialOps.Api.Features.Customers.Application.CreateCustomer;

public sealed class CreateCustomerValidator: AbstractValidator<CreateCustomerRequest>
{
    public CreateCustomerValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty()
            .WithMessage("OrganizationId is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Customer name is required.")
            .MaximumLength(200);

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Email address is invalid.")
            .MaximumLength(320);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(50)
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));
    }
}