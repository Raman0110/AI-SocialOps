namespace SocialOps.Api.Features.AI.Application.GenerateReply.Dtos;

public sealed record GenerateReplyRequest(
    string? CustomerName,
    string Platform,
    IReadOnlyList<GenerateReplyMessage> Messages
);

public sealed record GenerateReplyMessage(
    string Sender,
    string Content
);