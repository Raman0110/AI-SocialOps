using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Organizations.Domain;

namespace SocialOps.Api.Features.Organizations.Infrastructure;

public sealed class OrganizationConfiguration: IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("organizations");

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();
    }
}