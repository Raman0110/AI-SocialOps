using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Organizations.Application.CreateOrganization;

namespace SocialOps.Api.Features.Organizations.Controllers;

[ApiController]
[Route("api/organizations")]
public sealed class OrganizationsController : ControllerBase
{
    private readonly CreateOrganizationService _createService;
    private readonly IValidator<CreateOrganizationRequest> _validator;

    public OrganizationsController(
        CreateOrganizationService createService,
        IValidator<CreateOrganizationRequest> validator)
    {
        _createService = createService;
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

        var response = await _createService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CreateOrganizationService>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await _createService.GetByIdAsync(id, cancellationToken);

        if (response is null)
        {
            return NotFound();
        }

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CreateOrganizationService>>> GetAll(CancellationToken cancellationToken)
    {
        var response = await _createService.GetAllAsync(cancellationToken);

        return Ok(response);
    }
}