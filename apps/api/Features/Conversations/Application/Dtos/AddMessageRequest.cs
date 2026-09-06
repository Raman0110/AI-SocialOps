using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record AddMessageRequest(
    MessageDirection Direction,
    MessageSenderType SenderType,
    string Content,
    string? ExternalMessageId
);