using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.SocialAccounts.Infrastructure;

public sealed class SocialAccountConfiguration: IEntityTypeConfiguration<SocialAccount>
{
    public void Configure(EntityTypeBuilder<SocialAccount> builder)
    {
        builder.ToTable("social_accounts");

        builder.Property(x => x.Platform)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.ExternalAccountId)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.DisplayName)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.OrganizationId,
            x.Platform,
            x.ExternalAccountId
        })
        .IsUnique();
    }
}