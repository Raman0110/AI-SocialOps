using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.SocialAccounts.Application.Dtos;
using SocialOps.Api.Features.SocialAccounts.Application.Services;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.SocialAccounts.Controllers;

[ApiController]
[Route("api/social-accounts")]
public sealed class SocialAccountsController : ControllerBase
{
    private readonly SocialAccountService _socialAccountService;
    private readonly IValidator<CreateSocialAccountRequest> _validator;
    private readonly ITenantContext _tenantContext;

    public SocialAccountsController(
        SocialAccountService createService,
        IValidator<CreateSocialAccountRequest> validator,
        ITenantContext tenantContext)
    {
        _socialAccountService = createService;
        _validator = validator;
        _tenantContext = tenantContext;
    }

    [HttpPost]
    public async Task<ActionResult<SocialAccountResponse>> Create(
        [FromBody] CreateSocialAccountRequest request,
        CancellationToken cancellationToken)
    {
        request = request with
        {
            OrganizationId = _tenantContext.RequireOrganizationId()
        };

        var validationResult = await _validator.ValidateAsync(
                request,
                cancellationToken);

        if (!validationResult.IsValid) return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));

        var response = await _socialAccountService.CreateAsync(
                request,
                cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Id },
            response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SocialAccountResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await _socialAccountService.GetByIdAsync(
                id,
                cancellationToken);

        if (response is null) return NotFound();

        _tenantContext.EnsureOrganization(response.OrganizationId);

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SocialAccountResponse>>> GetAll(
        [FromQuery] Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var tenantOrganizationId = _tenantContext.RequireOrganizationId();

        if (organizationId.HasValue)
        {
            _tenantContext.EnsureOrganization(organizationId.Value);
        }

        var response = await _socialAccountService.GetByOrganizationIdAsync(
                tenantOrganizationId,
                cancellationToken);

        return Ok(response);
    }
}
