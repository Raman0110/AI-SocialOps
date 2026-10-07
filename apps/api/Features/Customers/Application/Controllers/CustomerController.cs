using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Customers.Application.CreateCustomer;
using SocialOps.Api.Features.Customers.Application.Dtos;
using SocialOps.Api.Features.Customers.Application.Services;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Tenancy;


namespace SocialOps.Api.Features.Customers.Controllers;

[ApiController]
[Authorize(Policy = SocialOpsPolicies.TenantReader)]
[Route("api/customers")]
public sealed class CustomersController : ControllerBase
{
    private readonly CustomerService _customerService;
    private readonly IValidator<CreateCustomerRequest> _validator;
    private readonly ITenantContext _tenantContext;

    public CustomersController(
        CustomerService createService,
        IValidator<CreateCustomerRequest> validator,
        ITenantContext tenantContext)
    {
        _customerService = createService;
        _validator = validator;
        _tenantContext = tenantContext;
    }

    [HttpPost]
    [Authorize(Policy = SocialOpsPolicies.TenantOperator)]
    public async Task<ActionResult<CustomerResponse>> Create(
        [FromBody] CreateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        request = request with
        {
            OrganizationId = _tenantContext.RequireOrganizationId()
        };

        var validationResult = await _validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));
        }

        var response = await _customerService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Id },
            response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await _customerService.GetByIdAsync(id, cancellationToken);

        if (response is null)
        {
            return NotFound();
        }

        _tenantContext.EnsureOrganization(response.OrganizationId);

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomerResponse>>> GetAll(
        [FromQuery] Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var tenantOrganizationId = _tenantContext.RequireOrganizationId();

        if (organizationId.HasValue)
        {
            _tenantContext.EnsureOrganization(organizationId.Value);
        }

        var response =  await _customerService.GetByOrganizationIdAsync(tenantOrganizationId, cancellationToken);

        return Ok(response);
    }
}
