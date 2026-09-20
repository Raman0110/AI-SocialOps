namespace SocialOps.Api.Features.AgentActions.Application.Dtos;

public sealed record GetPendingAgentActionResponse(
    Guid Id,
    string Type,
    string PayloadJson,
    DateTime CreatedAt
);