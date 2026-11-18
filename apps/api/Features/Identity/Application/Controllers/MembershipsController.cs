using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Identity.Application.Dtos;
using SocialOps.Api.Features.Identity.Application.Services;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.Identity.Application.Controllers;

[ApiController]
[Authorize(Policy = SocialOpsPolicies.TenantAdmin)]
[Route("api/memberships")]
public sealed class MembershipsController : ControllerBase
{
    private readonly MembershipService _service;
    private readonly ITenantContext _tenantContext;

    public MembershipsController(MembershipService service, ITenantContext tenantContext)
    {
        _service = service;
        _tenantContext = tenantContext;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MembershipResponse>>> Get(
        CancellationToken cancellationToken) =>
        Ok(await _service.GetAsync(_tenantContext.RequireOrganizationId(), cancellationToken));

    [HttpPost]
    public async Task<ActionResult<MembershipResponse>> Create(
        CreateMembershipRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _service.CreateAsync(
            _tenantContext.RequireOrganizationId(),
            RequireRole(),
            request,
            cancellationToken);

        return Created($"api/memberships/{response.Id}", response);
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<ActionResult<MembershipResponse>> UpdateRole(
        Guid id,
        UpdateMembershipRoleRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _service.UpdateRoleAsync(
            _tenantContext.RequireOrganizationId(),
            id,
            RequireUserId(),
            RequireRole(),
            request,
            cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(
            _tenantContext.RequireOrganizationId(),
            id,
            RequireUserId(),
            RequireRole(),
            cancellationToken);

        return NoContent();
    }

    private Guid RequireUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string RequireRole() =>
        User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
}
