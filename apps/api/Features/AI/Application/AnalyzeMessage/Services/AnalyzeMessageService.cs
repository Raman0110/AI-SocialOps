using SocialOps.Api.Features.AI.Application.AnalyzeMessage.Dtos;
using SocialOps.Api.Features.AI.Infrastructure;

namespace SocialOps.Api.Features.AI.Application.AnalyzeMessage.Services;

public sealed class AnalyzeMessageService
{
    private readonly AgentClient _agentClient;

    public AnalyzeMessageService(AgentClient agentClient)
    {
        _agentClient = agentClient;
    }

    public Task<AnalyzeMessageResponse> AnalyzeAsync(AnalyzeMessageRequest request, CancellationToken cancellationToken = default)
    {
        return _agentClient.AnalyzeMessageAsync(request, cancellationToken);
    }
}