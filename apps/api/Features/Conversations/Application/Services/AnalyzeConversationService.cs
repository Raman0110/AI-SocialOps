using SocialOps.Api.Features.AI.Application.AnalyzeMessage.Dtos;
using SocialOps.Api.Features.AI.Infrastructure;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Services.AnalyzeConversation;

public sealed class AnalyzeConversationService
{
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageAnalysisRepository _analysisRepository;
    private readonly AgentClient _agentClient;

    public AnalyzeConversationService(
        IMessageRepository messageRepository,
        IMessageAnalysisRepository analysisRepository,
        AgentClient agentClient)
    {
        _messageRepository = messageRepository;
        _analysisRepository = analysisRepository;
        _agentClient = agentClient;
    }

    public async Task<AnalyzeConversationResponse?> AnalyzeAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        var message = await _messageRepository.GetLatestInboundAsync(conversationId, cancellationToken);

        if (message is null) return null;

        var existing = await _analysisRepository.GetByMessageIdAsync(message.Id, cancellationToken);

        if (existing is not null) return Map(existing);

        var aiResult = await _agentClient.AnalyzeMessageAsync(new AnalyzeMessageRequest(message.Content), cancellationToken);

        var analysis = new MessageAnalysis
        {
            Id = Guid.NewGuid(),
            MessageId = message.Id,
            Intent = aiResult.Intent,
            Sentiment = aiResult.Sentiment,
            Priority = aiResult.Priority,
            Risk = aiResult.Risk,
            Confidence = aiResult.Confidence,
            AnalyzedAt = DateTime.UtcNow
        };

        await _analysisRepository.AddAsync(analysis, cancellationToken);

        await _analysisRepository.SaveChangesAsync(cancellationToken);

        return Map(analysis);
    }

    private static AnalyzeConversationResponse Map(MessageAnalysis analysis)
    {
        return new AnalyzeConversationResponse(
            analysis.MessageId,
            analysis.Intent,
            analysis.Sentiment,
            analysis.Priority,
            analysis.Risk,
            analysis.Confidence,
            analysis.AnalyzedAt);
    }
}