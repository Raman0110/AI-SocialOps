namespace SocialOps.Api.Features.AgentRuns.Application.Dtos;

public sealed record AgentToolExecutionResponse(
    Guid Id,
    string ToolName,
    string ArgumentsJson,
    string? ResultJson,
    bool Success,
    string? Error,
    DateTime StartedAt,
    DateTime? CompletedAt,
    double? DurationMilliseconds
);
