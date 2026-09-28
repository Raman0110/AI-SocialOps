namespace SocialOps.Api.Features.AgentRuns.Application.Dtos;

public sealed record AgentRunSummaryResponse(
    Guid Id,
    Guid OrganizationId,
    Guid ConversationId,
    Guid InputMessageId,
    string Status,
    string? Model,
    DateTime StartedAt,
    DateTime? CompletedAt,
    double? DurationMilliseconds
);
