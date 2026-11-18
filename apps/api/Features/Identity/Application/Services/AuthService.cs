using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Identity.Application.Dtos;
using SocialOps.Api.Features.Identity.Domain;
using SocialOps.Api.Features.Organizations.Domain;
using SocialOps.Api.Shared.Data;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.Identity.Application.Services;

public sealed class AuthService
{
    private readonly SocialOpsDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly JwtTokenService _tokenService;

    public AuthService(
        SocialOpsDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        JwtTokenService tokenService)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthSessionResponse?> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await GetUserAsync(normalizedEmail, cancellationToken);

        if (user is null || !user.IsActive)
        {
            return null;
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var membership = request.OrganizationId.HasValue
            ? user.Memberships.SingleOrDefault(x => x.OrganizationId == request.OrganizationId.Value)
            : user.Memberships.OrderBy(x => x.CreatedAt).FirstOrDefault();

        return membership is null
            ? null
            : _tokenService.Create(user, membership, MapMemberships(user));
    }

    public async Task<CurrentSessionResponse?> GetCurrentAsync(
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var user = await GetUserByIdAsync(userId, cancellationToken);
        var membership = user?.Memberships.SingleOrDefault(x => x.OrganizationId == organizationId);

        return user is null || membership is null || !user.IsActive
            ? null
            : new CurrentSessionResponse(
                new AuthUserResponse(user.Id, user.Name, user.Email),
                MapMembership(membership),
                MapMemberships(user));
    }

    public async Task<AuthSessionResponse?> SwitchOrganizationAsync(
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var user = await GetUserByIdAsync(userId, cancellationToken);
        var membership = user?.Memberships.SingleOrDefault(x => x.OrganizationId == organizationId);

        return user is null || membership is null || !user.IsActive
            ? null
            : _tokenService.Create(user, membership, MapMemberships(user));
    }

    public async Task<AuthSessionResponse?> CreateOrganizationAsync(
        Guid userId,
        string organizationName,
        CancellationToken cancellationToken)
    {
        var user = await GetUserByIdAsync(userId, cancellationToken);

        if (user is null || !user.IsActive)
        {
            return null;
        }

        var name = organizationName.Trim();
        var nameExists = await _dbContext.Organizations
            .AnyAsync(x => x.Name.ToLower() == name.ToLower(), cancellationToken);

        if (nameExists)
        {
            throw new ConflictException("An organization with this name already exists.");
        }

        var now = DateTime.UtcNow;
        var organization = new Organization
        {
            Id = Guid.NewGuid(),
            Name = name,
            CreatedAt = now
        };
        var membership = new OrganizationMembership
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            User = user,
            OrganizationId = organization.Id,
            Organization = organization,
            Role = MembershipRole.Owner,
            CreatedAt = now
        };

        _dbContext.Organizations.Add(organization);
        _dbContext.OrganizationMemberships.Add(membership);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return _tokenService.Create(user, membership, MapMemberships(user));
    }

    public static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

    private Task<User?> GetUserAsync(string normalizedEmail, CancellationToken cancellationToken) =>
        _dbContext.Users
            .Include(x => x.Memberships)
            .ThenInclude(x => x.Organization)
            .SingleOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail, cancellationToken);

    private Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Users
            .Include(x => x.Memberships)
            .ThenInclude(x => x.Organization)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

    private static IReadOnlyList<AuthOrganizationResponse> MapMemberships(User user) =>
        user.Memberships
            .OrderBy(x => x.Organization.Name)
            .Select(MapMembership)
            .ToArray();

    private static AuthOrganizationResponse MapMembership(OrganizationMembership membership) =>
        new(membership.OrganizationId, membership.Organization.Name, membership.Role.ToString());
}
