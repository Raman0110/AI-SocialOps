namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record GetConversationHistoryResponse(
    Guid ConversationId,
    IReadOnlyList<ConversationHistoryMessageResponse> Messages
);

public sealed record ConversationHistoryMessageResponse(
    string Sender,
    string Content,
    DateTime SentAt
);