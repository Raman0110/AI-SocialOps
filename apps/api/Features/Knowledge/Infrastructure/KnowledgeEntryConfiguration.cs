using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialOps.Api.Features.Knowledge.Domain;

namespace SocialOps.Api.Features.Knowledge.Infrastructure;

public sealed class KnowledgeEntryConfiguration : IEntityTypeConfiguration<KnowledgeEntry>
{
    public void Configure(EntityTypeBuilder<KnowledgeEntry> builder)
    {
        builder.ToTable("knowledge_entries");

        builder.Property(x => x.Title)
            .HasMaxLength(KnowledgeLimits.TitleMaxLength)
            .IsRequired();

        builder.Property(x => x.Content)
            .HasMaxLength(KnowledgeLimits.ContentMaxLength)
            .IsRequired();

        builder.HasIndex(x => x.OrganizationId);
    }
}
