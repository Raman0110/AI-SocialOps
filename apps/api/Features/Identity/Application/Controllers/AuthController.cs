using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.Identity.Application.Dtos;
using SocialOps.Api.Features.Identity.Application.Services;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.Identity.Application.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ITenantContext _tenantContext;

    public AuthController(AuthService authService, ITenantContext tenantContext)
    {
        _authService = authService;
        _tenantContext = tenantContext;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthSessionResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["credentials"] = ["Email and password are required."]
            }));
        }

        var response = await _authService.LoginAsync(request, cancellationToken);

        return response is null ? Unauthorized() : Ok(response);
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentSessionResponse>> Me(CancellationToken cancellationToken)
    {
        var response = await _authService.GetCurrentAsync(
            RequireUserId(),
            _tenantContext.RequireOrganizationId(),
            cancellationToken);

        return response is null ? Unauthorized() : Ok(response);
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("switch-organization")]
    public async Task<ActionResult<AuthSessionResponse>> SwitchOrganization(
        SwitchOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _authService.SwitchOrganizationAsync(
            RequireUserId(),
            request.OrganizationId,
            cancellationToken);

        return response is null ? Forbid() : Ok(response);
    }

    private Guid RequireUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("A user identity is required.");
    }
}
