using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Organizations.Application.CreateOrganization;

namespace SocialOps.Api.Features.Organizations.Application.Controllers;

[ApiController]
[Route("api/organizations")]
public sealed class OrganizationsController : ControllerBase
{
    private readonly CreateOrganizationService _service;
    private readonly IValidator<CreateOrganizationRequest> _validator;

    public OrganizationsController(CreateOrganizationService service, IValidator<CreateOrganizationRequest> validator)
    {
        _service = service;
        _validator = validator;
    }

    [HttpPost]
    public async Task<ActionResult<CreateOrganizationResponse>> Create([FromBody] CreateOrganizationRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));
        }

        var response = await _service.CreateAsync(request, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Id },
            response);
    }

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        return Ok();
    }
}