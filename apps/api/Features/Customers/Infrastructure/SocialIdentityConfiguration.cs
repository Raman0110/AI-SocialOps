using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Customers.Domain;

namespace SocialOps.Api.Features.Customers.Infrastructure;

public sealed class SocialIdentityConfiguration: IEntityTypeConfiguration<SocialIdentity>
{
    public void Configure(EntityTypeBuilder<SocialIdentity> builder)
    {
        builder.ToTable("social_identities");

        builder.Property(x => x.Platform)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.ExternalUserId)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Username)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.Platform,
            x.ExternalUserId
        })
        .IsUnique();
    }
}