namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record GenerateAgentReplyResponse(
    string Reply,
    IReadOnlyList<string> ToolsUsed,
    IReadOnlyList<Guid> PendingActionIds
);