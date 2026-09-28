using SocialOps.Api.Features.AgentRuns.Application.Abstractions;
using SocialOps.Api.Features.AgentRuns.Application.Dtos;
using SocialOps.Api.Features.AgentRuns.Domain;

namespace SocialOps.Api.Features.AgentRuns.Application.Services;

public sealed class GetAgentRunsService
{
  private const int DefaultLimit = 50;
  private const int MaximumLimit = 100;
  private readonly IAgentRunRepository _repository;

  public GetAgentRunsService(IAgentRunRepository repository)
  {
    _repository = repository;
  }

  public async Task<IReadOnlyList<AgentRunSummaryResponse>> GetByConversationAsync(
      Guid conversationId,
      Guid organizationId,
      int? limit,
      CancellationToken cancellationToken = default)
  {
    var appliedLimit = Math.Clamp(limit ?? DefaultLimit, 1, MaximumLimit);
    var runs = await _repository.GetByConversationIdAsync(
        conversationId,
        organizationId,
        appliedLimit,
        cancellationToken);

    return runs.Select(MapSummary).ToList();
  }

  public async Task<AgentRunDetailResponse?> GetByIdAsync(
      Guid id,
      Guid organizationId,
      CancellationToken cancellationToken = default)
  {
    var run = await _repository.GetByIdAsync(id, organizationId, cancellationToken);

    if (run is null) return null;

    var toolExecutions = run.ToolExecutions
        .OrderBy(x => x.StartedAt)
        .ThenBy(x => x.Id)
        .Select(x => new AgentToolExecutionResponse(
            x.Id,
            x.ToolName,
            x.ArgumentsJson,
            x.ResultJson,
            x.Success,
            x.Error,
            x.StartedAt,
            x.CompletedAt,
            GetDurationMilliseconds(x.StartedAt, x.CompletedAt)))
        .ToList();

    return new AgentRunDetailResponse(
        run.Id,
        run.OrganizationId,
        run.ConversationId,
        run.InputMessageId,
        run.Status.ToString(),
        run.Model,
        run.FinalReply,
        run.Error,
        run.StartedAt,
        run.CompletedAt,
        GetDurationMilliseconds(run.StartedAt, run.CompletedAt),
        toolExecutions);
  }

  private static AgentRunSummaryResponse MapSummary(AgentRun run)
  {
    return new AgentRunSummaryResponse(
        run.Id,
        run.OrganizationId,
        run.ConversationId,
        run.InputMessageId,
        run.Status.ToString(),
        run.Model,
        run.StartedAt,
        run.CompletedAt,
        GetDurationMilliseconds(run.StartedAt, run.CompletedAt));
  }

  private static double? GetDurationMilliseconds(DateTime startedAt, DateTime? completedAt)
  {
    return completedAt.HasValue
        ? (completedAt.Value - startedAt).TotalMilliseconds
        : null;
  }
}
