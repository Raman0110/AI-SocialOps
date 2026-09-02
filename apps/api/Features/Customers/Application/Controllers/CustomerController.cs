using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Customers.Application.CreateCustomer;
using SocialOps.Api.Features.Customers.Application.Dtos;
using SocialOps.Api.Features.Customers.Application.Services;


namespace SocialOps.Api.Features.Customers.Controllers;

[ApiController]
[Route("api/customers")]
public sealed class CustomersController : ControllerBase
{
    private readonly CustomerService _customerService;
    private readonly IValidator<CreateCustomerRequest> _validator;

    public CustomersController(
        CustomerService createService,
        IValidator<CreateCustomerRequest> validator)
    {
        _customerService = createService;
        _validator = validator;
    }

    [HttpPost]
    public async Task<ActionResult<CustomerResponse>> Create(
        [FromBody] CreateCustomerRequest request,
        CancellationToken cancellationToken)
    {
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

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomerResponse>>> GetAll(
        [FromQuery] Guid organizationId,
        CancellationToken cancellationToken)
    {
        var response =  await _customerService.GetByOrganizationIdAsync(organizationId, cancellationToken);

        return Ok(response);
    }
}   