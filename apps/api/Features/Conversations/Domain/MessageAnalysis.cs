namespace SocialOps.Api.Features.Conversations.Domain;

public class MessageAnalysis
{
    public Guid Id { get; set; }

    public Guid MessageId { get; set; }

    public required string Intent { get; set; }

    public required string Sentiment { get; set; }

    public required string Priority { get; set; }

    public required string Risk { get; set; }

    public double Confidence { get; set; }

    public string? Model { get; set; }

    public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;

    public Message Message { get; set; } = null!;
}