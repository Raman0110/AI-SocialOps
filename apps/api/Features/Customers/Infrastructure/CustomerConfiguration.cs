using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Customers.Domain;

namespace SocialOps.Api.Features.Customers.Infrastructure;

public sealed class CustomerConfiguration: IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Email)
            .HasMaxLength(320);

        builder.Property(x => x.PhoneNumber)
            .HasMaxLength(50);

        builder.HasIndex(x => new
        {
            x.OrganizationId,
            x.Email
        });
    }
}