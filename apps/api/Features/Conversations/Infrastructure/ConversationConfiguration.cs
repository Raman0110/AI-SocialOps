using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Infrastructure;

public sealed class ConversationConfiguration: IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("conversations");

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.ExternalConversationId)
            .HasMaxLength(200);

        builder.HasIndex(x => new
        {
            x.OrganizationId,
            x.Status,
            x.LastMessageAt
        });
    }
}