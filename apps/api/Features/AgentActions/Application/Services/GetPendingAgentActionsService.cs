using SocialOps.Api.Features.AgentActions.Application.Abstractions;
using SocialOps.Api.Features.AgentActions.Application.Dtos;

namespace SocialOps.Api.Features.AgentActions.Application.GetPendingActions;

public sealed class GetPendingAgentActionsService
{
  private readonly IAgentActionRepository _repository;

  public GetPendingAgentActionsService(IAgentActionRepository repository)
  {
    _repository = repository;
  }

  public async Task<IReadOnlyList<GetPendingAgentActionResponse>> GetAsync(Guid conversationId, CancellationToken cancellationToken = default)
  {
    var actions = await _repository.GetPendingByConversationIdAsync(conversationId, cancellationToken);

    return actions
        .Select(x => new GetPendingAgentActionResponse(
            x.Id,
            x.Type.ToString(),
            x.PayloadJson,
            x.CreatedAt))
        .ToList();
  }
}