namespace SocialOps.Api.Features.AgentRuns.Application.Dtos;

public sealed record AgentRunDetailResponse(
    Guid Id,
    Guid OrganizationId,
    Guid ConversationId,
    Guid InputMessageId,
    string Status,
    string? Model,
    string? FinalReply,
    string? Error,
    DateTime StartedAt,
    DateTime? CompletedAt,
    double? DurationMilliseconds,
    IReadOnlyList<AgentToolExecutionResponse> ToolExecutions
);
