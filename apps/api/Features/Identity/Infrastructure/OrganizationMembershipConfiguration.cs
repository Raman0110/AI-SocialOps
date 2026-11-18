using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Identity.Domain;

namespace SocialOps.Api.Features.Identity.Infrastructure;

public sealed class OrganizationMembershipConfiguration : IEntityTypeConfiguration<OrganizationMembership>
{
    public void Configure(EntityTypeBuilder<OrganizationMembership> builder)
    {
        builder.ToTable("organization_memberships");

        builder.Property(x => x.Role)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => new { x.UserId, x.OrganizationId }).IsUnique();
        builder.HasIndex(x => new { x.OrganizationId, x.Role });

        builder.HasOne(x => x.User)
            .WithMany(x => x.Memberships)
            .HasForeignKey(x => x.UserId);

        builder.HasOne(x => x.Organization)
            .WithMany(x => x.Memberships)
            .HasForeignKey(x => x.OrganizationId);
    }
}
