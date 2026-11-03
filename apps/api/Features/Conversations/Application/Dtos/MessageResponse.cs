using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record MessageResponse(
    Guid Id,
    Guid ConversationId,
    MessageDirection Direction,
    MessageSenderType SenderType,
    string Content,
    string? ExternalMessageId,
    DateTime SentAt,
    MessageDeliveryStatus DeliveryStatus,
    string? DeliveryError
);