namespace SocialOps.Api.Features.AI.Application.RunAgent.Dtos;

public sealed record RunAgentRequest(
    string ConversationId,
    string Message
);