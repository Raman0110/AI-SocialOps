using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Infrastructure;

public sealed class MessageAnalysisConfiguration: IEntityTypeConfiguration<MessageAnalysis>
{
    public void Configure(EntityTypeBuilder<MessageAnalysis> builder)
    {
        builder.ToTable("message_analyses");

        builder.Property(x => x.Intent)
            .HasMaxLength(100);

        builder.Property(x => x.Sentiment)
            .HasMaxLength(50);

        builder.Property(x => x.Priority)
            .HasMaxLength(50);

        builder.Property(x => x.Risk)
            .HasMaxLength(50);

        builder.Property(x => x.Model)
            .HasMaxLength(200);

        builder.HasIndex(x => x.MessageId)
            .IsUnique();

        builder.HasOne(x => x.Message)
            .WithOne(x => x.Analysis)
            .HasForeignKey<MessageAnalysis>(
                x => x.MessageId);
    }
}