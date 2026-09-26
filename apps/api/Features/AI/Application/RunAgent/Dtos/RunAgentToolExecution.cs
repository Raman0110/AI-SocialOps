namespace SocialOps.Api.Features.AI.Application.RunAgent.Dtos;

public sealed record RunAgentToolExecution(
    string ToolName,
    string ArgumentsJson,
    string? ResultJson,
    bool Success,
    string? Error
);