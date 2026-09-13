namespace SocialOps.Api.Features.AI.Application.AnalyzeMessage.Dtos;

public sealed record AnalyzeMessageResponse(
    string Intent,
    string Sentiment,
    string Priority,
    string Risk,
    double Confidence
);