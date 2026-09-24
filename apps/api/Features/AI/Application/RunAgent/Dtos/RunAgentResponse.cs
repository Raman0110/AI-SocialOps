namespace SocialOps.Api.Features.AI.Application.RunAgent.Dtos;

public sealed record RunAgentResponse(
    string Reply,
    IReadOnlyList<string> ToolsUsed,
    IReadOnlyList<Guid> PendingActionIds
);