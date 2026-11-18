using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SocialOps.Api.Features.Identity.Application.Dtos;
using SocialOps.Api.Features.Identity.Domain;
using SocialOps.Api.Shared.Auth;

namespace SocialOps.Api.Features.Identity.Application.Services;

public sealed class JwtTokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public AuthSessionResponse Create(
        User user,
        OrganizationMembership membership,
        IReadOnlyList<AuthOrganizationResponse> memberships)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_options.AccessTokenMinutes);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, membership.Role.ToString()),
            new Claim(SocialOpsClaimTypes.OrganizationId, membership.OrganizationId.ToString()),
            new Claim(SocialOpsClaimTypes.MembershipId, membership.Id.ToString()),
            new Claim(SocialOpsClaimTypes.MembershipVersion, membership.Version.ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        return new AuthSessionResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt,
            new AuthUserResponse(user.Id, user.Name, user.Email),
            new AuthOrganizationResponse(
                membership.OrganizationId,
                membership.Organization.Name,
                membership.Role.ToString()),
            memberships);
    }
}
