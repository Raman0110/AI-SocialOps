using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Customers.Application.Dtos;
using SocialOps.Api.Features.Customers.Application.Dtos.CreateSocialIdentity;
using SocialOps.Api.Features.Customers.Application.Services;

namespace SocialOps.Api.Features.Customers.Controllers;

[ApiController]
[Route("api/customers/{customerId:guid}/social-identities")]
public sealed class SocialIdentitiesController : ControllerBase
{
    private readonly CreateSocialIdentityService _createService;
    private readonly IValidator<CreateSocialIdentityRequest> _validator;

    public SocialIdentitiesController(
        CreateSocialIdentityService createService,
        IValidator<CreateSocialIdentityRequest> validator)
    {
        _createService = createService;
        _validator = validator;
    }

    [HttpPost]
    public async Task<ActionResult<SocialIdentityResponse>> Create(
        Guid customerId,
        [FromBody] CreateSocialIdentityRequest request,
        CancellationToken cancellationToken)
    {
        request = request with
        {
            CustomerId = customerId
        };

        var validationResult = await _validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid) return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));

        var response = await _createService.CreateAsync(request, cancellationToken);

        return Created(
            $"/api/customers/{customerId}/social-identities/{response.Id}",
            response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SocialIdentityResponse>>> GetAll(
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var response = await _createService.GetByCustomerIdAsync(customerId, cancellationToken);

        return Ok(response);
    }
}