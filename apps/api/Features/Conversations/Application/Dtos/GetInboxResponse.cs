using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record GetInboxResponse(
    Guid Id,
    string CustomerName,
    SocialPlatform Platform,
    string Username,
    string SocialAccountName,
    ConversationStatus Status,
    string? LastMessage,
    DateTime? LastMessageAt
);