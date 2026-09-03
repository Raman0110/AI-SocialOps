using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.SocialAccounts.Application.Dtos;
using SocialOps.Api.Features.SocialAccounts.Application.Services;

namespace SocialOps.Api.Features.SocialAccounts.Controllers;

[ApiController]
[Route("api/social-accounts")]
public sealed class SocialAccountsController : ControllerBase
{
    private readonly SocialAccountService _socialAccountService;
    private readonly IValidator<CreateSocialAccountRequest> _validator;

    public SocialAccountsController(
        SocialAccountService createService,
        IValidator<CreateSocialAccountRequest> validator)
    {
        _socialAccountService = createService;
        _validator = validator;
    }

    [HttpPost]
    public async Task<ActionResult<SocialAccountResponse>> Create(
        [FromBody] CreateSocialAccountRequest request,
        CancellationToken cancellationToken)
    {
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

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SocialAccountResponse>>> GetAll(
        [FromQuery] Guid organizationId,
        CancellationToken cancellationToken)
    {
        var response = await _socialAccountService.GetByOrganizationIdAsync(
                organizationId,
                cancellationToken);

        return Ok(response);
    }
}