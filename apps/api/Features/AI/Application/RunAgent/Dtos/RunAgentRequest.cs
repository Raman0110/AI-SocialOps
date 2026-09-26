using System.Text.Json.Serialization;

namespace SocialOps.Api.Features.AI.Application.RunAgent.Dtos;

public sealed record RunAgentRequest(
    [property: JsonPropertyName("conversation_id")]
    string ConversationId,

    string Message
);
