using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.Identity.Application.Dtos;
using SocialOps.Api.Features.Identity.Domain;
using SocialOps.Api.Shared.Data;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.Identity.Application.Services;

public sealed class MembershipService
{
    private readonly SocialOpsDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public MembershipService(
        SocialOpsDbContext dbContext,
        IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<IReadOnlyList<MembershipResponse>> GetAsync(
        Guid organizationId,
        CancellationToken cancellationToken) =>
        await _dbContext.OrganizationMemberships
            .AsNoTracking()
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.User.Name)
            .Select(x => new MembershipResponse(
                x.Id,
                x.UserId,
                x.User.Name,
                x.User.Email,
                x.Role.ToString(),
                x.CreatedAt))
            .ToListAsync(cancellationToken);

    public async Task<MembershipResponse> CreateAsync(
        Guid organizationId,
        string requesterRole,
        CreateMembershipRequest request,
        CancellationToken cancellationToken)
    {
        var role = ParseRole(request.Role);
        EnsureCanManageRole(requesterRole, role);

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Name))
        {
            throw new BusinessRuleException("Name and email are required.");
        }

        var normalizedEmail = AuthService.NormalizeEmail(request.Email);
        var user = await _dbContext.Users
            .Include(x => x.Memberships)
            .SingleOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user?.Memberships.Any(x => x.OrganizationId == organizationId) == true)
        {
            throw new ConflictException("This user already belongs to the organization.");
        }

        if (user is null)
        {
            if (string.IsNullOrWhiteSpace(request.TemporaryPassword) || request.TemporaryPassword.Length < 8)
            {
                throw new BusinessRuleException(
                    "A temporary password with at least 8 characters is required for a new user.");
            }

            user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Email = request.Email.Trim(),
                NormalizedEmail = normalizedEmail,
                PasswordHash = string.Empty
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, request.TemporaryPassword);
            _dbContext.Users.Add(user);
        }

        var membership = new OrganizationMembership
        {
            Id = Guid.NewGuid(),
            User = user,
            OrganizationId = organizationId,
            Role = role
        };

        _dbContext.OrganizationMemberships.Add(membership);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Map(membership, user);
    }

    public async Task<MembershipResponse> UpdateRoleAsync(
        Guid organizationId,
        Guid membershipId,
        Guid requesterUserId,
        string requesterRole,
        UpdateMembershipRoleRequest request,
        CancellationToken cancellationToken)
    {
        var nextRole = ParseRole(request.Role);
        var membership = await _dbContext.OrganizationMemberships
            .Include(x => x.User)
            .SingleOrDefaultAsync(
                x => x.Id == membershipId && x.OrganizationId == organizationId,
                cancellationToken)
            ?? throw new ResourceNotFoundException("Membership was not found.");

        if (membership.UserId == requesterUserId && membership.Role != nextRole)
        {
            throw new BusinessRuleException(
                "Switch to another owner or administrator before changing your active role.");
        }

        EnsureCanManageRole(requesterRole, membership.Role);
        EnsureCanManageRole(requesterRole, nextRole);

        if (membership.Role == MembershipRole.Owner && nextRole != MembershipRole.Owner)
        {
            await EnsureAnotherOwnerExistsAsync(organizationId, membership.Id, cancellationToken);
        }

        membership.Role = nextRole;
        membership.Version += 1;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Map(membership, membership.User);
    }

    public async Task DeleteAsync(
        Guid organizationId,
        Guid membershipId,
        Guid requesterUserId,
        string requesterRole,
        CancellationToken cancellationToken)
    {
        var membership = await _dbContext.OrganizationMemberships
            .SingleOrDefaultAsync(
                x => x.Id == membershipId && x.OrganizationId == organizationId,
                cancellationToken)
            ?? throw new ResourceNotFoundException("Membership was not found.");

        if (membership.UserId == requesterUserId)
        {
            throw new BusinessRuleException("You cannot remove your active membership.");
        }

        EnsureCanManageRole(requesterRole, membership.Role);

        if (membership.Role == MembershipRole.Owner)
        {
            await EnsureAnotherOwnerExistsAsync(organizationId, membership.Id, cancellationToken);
        }

        _dbContext.OrganizationMemberships.Remove(membership);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureAnotherOwnerExistsAsync(
        Guid organizationId,
        Guid excludedMembershipId,
        CancellationToken cancellationToken)
    {
        var hasAnotherOwner = await _dbContext.OrganizationMemberships.AnyAsync(
            x => x.OrganizationId == organizationId &&
                 x.Id != excludedMembershipId &&
                 x.Role == MembershipRole.Owner,
            cancellationToken);

        if (!hasAnotherOwner)
        {
            throw new BusinessRuleException("The organization must keep at least one owner.");
        }
    }

    private static MembershipRole ParseRole(string value)
    {
        if (!Enum.TryParse<MembershipRole>(value, ignoreCase: true, out var role) ||
            !Enum.IsDefined(role))
        {
            throw new BusinessRuleException("Role must be Owner, Admin, Agent, or Viewer.");
        }

        return role;
    }

    private static void EnsureCanManageRole(string requesterRole, MembershipRole targetRole)
    {
        if (targetRole == MembershipRole.Owner &&
            !string.Equals(requesterRole, MembershipRole.Owner.ToString(), StringComparison.Ordinal))
        {
            throw new TenantAccessDeniedException("Only an owner can manage owner memberships.");
        }
    }

    private static MembershipResponse Map(OrganizationMembership membership, User user) =>
        new(
            membership.Id,
            user.Id,
            user.Name,
            user.Email,
            membership.Role.ToString(),
            membership.CreatedAt);
}
