namespace SocialOps.Api.Features.Conversations.Domain;

public class Message
{
    public Guid Id { get; set; }

    public Guid ConversationId { get; set; }

    public MessageDirection Direction { get; set; }

    public MessageSenderType SenderType { get; set; }

    public required string Content { get; set; }

    public string? ExternalMessageId { get; set; }

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public Conversation Conversation { get; set; } = null!;

    public MessageAnalysis? Analysis { get; set; }
}