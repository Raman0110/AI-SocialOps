using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Identity.Application.Dtos;
using SocialOps.Api.Features.Identity.Application.Services;
using SocialOps.Api.Features.Organizations.Application.CreateOrganization;
using SocialOps.Api.Features.Organizations.Application.Services;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.Organizations.Controllers;

[ApiController]
[Route("api/organizations")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public sealed class OrganizationsController : ControllerBase
{
    private readonly OrganizationService _organizationService;
    private readonly AuthService _authService;
    private readonly ITenantContext _tenantContext;
    private readonly IValidator<CreateOrganizationRequest> _validator;

    public OrganizationsController(
        OrganizationService organizationService,
        AuthService authService,
        ITenantContext tenantContext,
        IValidator<CreateOrganizationRequest> validator)
    {
        _organizationService = organizationService;
        _authService = authService;
        _tenantContext = tenantContext;
        _validator = validator;
    }

    [HttpPost]
    public async Task<ActionResult<AuthSessionResponse>> Create([FromBody] CreateOrganizationRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));
        }

        var response = await _authService.CreateOrganizationAsync(
            RequireUserId(),
            request.Name,
            cancellationToken);

        return response is null
            ? Unauthorized()
            : CreatedAtAction(nameof(GetById), new { id = response.Organization.Id }, response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrganizationResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (id != _tenantContext.RequireOrganizationId())
        {
            return Forbid();
        }

        var response = await _organizationService.GetByIdAsync(id, cancellationToken);

        if (response is null)
        {
            return NotFound();
        }

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrganizationResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var response = await _organizationService.GetByIdAsync(
            _tenantContext.RequireOrganizationId(),
            cancellationToken);

        return response is null ? NotFound() : Ok(new[] { response });
    }

    private Guid RequireUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("A user identity is required.");
    }
}
