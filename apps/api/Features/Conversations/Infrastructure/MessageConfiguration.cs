using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Infrastructure;

public sealed class MessageConfiguration: IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("messages");

        builder.Property(x => x.Direction)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.SenderType)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Content)
            .IsRequired();

        builder.Property(x => x.ExternalMessageId)
            .HasMaxLength(200);

        builder.HasIndex(x => new
        {
            x.ConversationId,
            x.SentAt
        });
    }
}