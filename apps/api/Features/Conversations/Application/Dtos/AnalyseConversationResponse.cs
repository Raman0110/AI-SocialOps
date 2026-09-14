namespace SocialOps.Api.Features.Conversations.Application.Dtos;

public sealed record AnalyzeConversationResponse(
    Guid MessageId,
    string Intent,
    string Sentiment,
    string Priority,
    string Risk,
    double Confidence,
    DateTime AnalyzedAt
);