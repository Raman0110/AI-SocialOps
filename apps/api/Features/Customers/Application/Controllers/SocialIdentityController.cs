using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Customers.Application.Dtos;
using SocialOps.Api.Features.Customers.Application.Dtos.CreateSocialIdentity;
using SocialOps.Api.Features.Customers.Application.Services;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.Customers.Controllers;

[ApiController]
[Route("api/customers/{customerId:guid}/social-identities")]
public sealed class SocialIdentitiesController : ControllerBase
{
    private readonly SocialIdentityService _socialIdentityService;
    private readonly CustomerService _customerService;
    private readonly IValidator<CreateSocialIdentityRequest> _validator;
    private readonly ITenantContext _tenantContext;

    public SocialIdentitiesController(
        SocialIdentityService socialIdentityService,
        CustomerService customerService,
        IValidator<CreateSocialIdentityRequest> validator,
        ITenantContext tenantContext)
    {
        _socialIdentityService = socialIdentityService;
        _customerService = customerService;
        _validator = validator;
        _tenantContext = tenantContext;
    }

    [HttpPost]
    public async Task<ActionResult<SocialIdentityResponse>> Create(
        Guid customerId,
        [FromBody] CreateSocialIdentityRequest request,
        CancellationToken cancellationToken)
    {
        var customer = await _customerService.GetByIdAsync(customerId, cancellationToken);

        if (customer is null) return NotFound();

        _tenantContext.EnsureOrganization(customer.OrganizationId);

        request = request with
        {
            CustomerId = customerId
        };

        var validationResult = await _validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid) return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));

        var response = await _socialIdentityService.CreateAsync(request, cancellationToken);

        return Created(
            $"/api/customers/{customerId}/social-identities/{response.Id}",
            response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SocialIdentityResponse>>> GetAll(
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var customer = await _customerService.GetByIdAsync(customerId, cancellationToken);

        if (customer is null) return NotFound();

        _tenantContext.EnsureOrganization(customer.OrganizationId);

        var response = await _socialIdentityService.GetByCustomerIdAsync(customerId, cancellationToken);

        return Ok(response);
    }
}
