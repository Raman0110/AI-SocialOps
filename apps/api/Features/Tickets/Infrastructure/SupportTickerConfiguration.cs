using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Tickets.Domain;

namespace SocialOps.Api.Features.Tickets.Infrastructure;

public sealed class SupportTicketConfiguration : IEntityTypeConfiguration<SupportTicket>
{
  public void Configure(EntityTypeBuilder<SupportTicket> builder)
  {
    builder.ToTable("support_tickets");

    builder.Property(x => x.Title)
        .HasMaxLength(250)
        .IsRequired();

    builder.Property(x => x.Description)
        .HasMaxLength(5000)
        .IsRequired();

    builder.Property(x => x.Priority)
        .HasConversion<string>()
        .HasMaxLength(50);

    builder.Property(x => x.Status)
        .HasConversion<string>()
        .HasMaxLength(50);

    builder.HasIndex(x => new
    {
      x.OrganizationId,
      x.Status
    });
  }
}