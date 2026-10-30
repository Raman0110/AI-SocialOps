using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Knowledge.Application.Dtos;
using SocialOps.Api.Features.Knowledge.Application.Services;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.Knowledge.Controllers;

[ApiController]
[Authorize(Policy = SocialOpsPolicies.TenantReader)]
[Route("api/knowledge")]
public sealed class KnowledgeController : ControllerBase
{
    private readonly KnowledgeService _service;
    private readonly IValidator<CreateKnowledgeEntryRequest> _validator;
    private readonly ITenantContext _tenantContext;

    public KnowledgeController(
        KnowledgeService service,
        IValidator<CreateKnowledgeEntryRequest> validator,
        ITenantContext tenantContext)
    {
        _service = service;
        _validator = validator;
        _tenantContext = tenantContext;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<KnowledgeEntryResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var response = await _service.GetAsync(_tenantContext.RequireOrganizationId(), cancellationToken);

        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = SocialOpsPolicies.TenantAdmin)]
    public async Task<ActionResult<KnowledgeEntryResponse>> Create(
        [FromBody] CreateKnowledgeEntryRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid) return ValidationProblem(new ValidationProblemDetails(validationResult.ToDictionary()));

        var response = await _service.CreateAsync(_tenantContext.RequireOrganizationId(), request, cancellationToken);

        return Created($"api/knowledge/{response.Id}", response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = SocialOpsPolicies.TenantAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteAsync(_tenantContext.RequireOrganizationId(), id, cancellationToken);

        if (!deleted) return NotFound();

        return NoContent();
    }
}
