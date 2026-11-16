using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Features.DevelopmentData.Application.Dtos;
using SocialOps.Api.Features.DevelopmentData.Application.Services;
using SocialOps.Api.Shared.Auth;
using SocialOps.Api.Shared.Data;
using SocialOps.Api.Shared.Tenancy;

namespace SocialOps.Api.Features.DevelopmentData.Application.Controllers;

[ApiController]
[Authorize(Policy = SocialOpsPolicies.TenantAdmin)]
[Route("api/development-data")]
public sealed class DevelopmentDataController : ControllerBase
{
    private readonly DevelopmentDataResetService _resetService;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly ITenantContext _tenantContext;

    public DevelopmentDataController(
        DevelopmentDataResetService resetService,
        IWebHostEnvironment environment,
        IConfiguration configuration,
        ITenantContext tenantContext)
    {
        _resetService = resetService;
        _environment = environment;
        _configuration = configuration;
        _tenantContext = tenantContext;
    }

    [HttpPost("reset")]
    public async Task<ActionResult<ResetDevelopmentDataResponse>> Reset(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment() || !_configuration.GetValue<bool>("DevelopmentData:EnableReset"))
        {
            return NotFound();
        }

        if (_tenantContext.RequireOrganizationId() != DevelopmentDataSeeder.OrganizationId)
        {
            return NotFound();
        }

        return Ok(await _resetService.ResetAsync(cancellationToken));
    }
}
