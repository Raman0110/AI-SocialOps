namespace SocialOps.Api.Features.AI.Application.RunAgent.Dtos;

public sealed record RunAgentResponse(
    string Reply,
    string Model,
    IReadOnlyList<string> ToolsUsed,
    IReadOnlyList<Guid> PendingActionIds,
    IReadOnlyList<RunAgentToolExecution> ToolExecutions
);