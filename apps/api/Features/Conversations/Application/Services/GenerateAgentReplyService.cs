using SocialOps.Api.Features.AgentRuns.Application.Abstractions;
using SocialOps.Api.Features.AgentRuns.Domain;
using SocialOps.Api.Features.AI.Application.RunAgent.Dtos;
using SocialOps.Api.Features.AI.Infrastructure;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos;

namespace SocialOps.Api.Features.Conversations.Application.GenerateAgentReply;

public sealed class GenerateAgentReplyService
{
  private readonly IConversationRepository _conversationRepository;
  private readonly IMessageRepository _messageRepository;
  private readonly AgentClient _agentClient;
  private readonly IAgentRunRepository _agentRunRepository;

  public GenerateAgentReplyService(
      IConversationRepository conversationRepository,
      IMessageRepository messageRepository,
      AgentClient agentClient,
      IAgentRunRepository agentRunRepository)
  {
    _conversationRepository = conversationRepository;
    _messageRepository = messageRepository;
    _agentClient = agentClient;
    _agentRunRepository = agentRunRepository;
  }

  public async Task<GenerateAgentReplyResponse?> GenerateAsync(Guid conversationId, CancellationToken cancellationToken = default)
  {
    var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);

    if (conversation is null) return null;

    var latestMessage = await _messageRepository.GetLatestInboundAsync(conversationId, cancellationToken);

    if (latestMessage is null) return null;

    var agentRun = new AgentRun
    {
      Id = Guid.NewGuid(),
      OrganizationId = conversation.OrganizationId,
      ConversationId = conversation.Id,
      InputMessageId = latestMessage.Id,
      Status = AgentRunStatus.Running,
      StartedAt = DateTime.UtcNow
    };

    await _agentRunRepository.AddAsync(agentRun, cancellationToken);

    await _agentRunRepository.SaveChangesAsync(cancellationToken);

    try
    {
      var result = await _agentClient.RunAgentAsync(
              new RunAgentRequest(conversationId.ToString(), latestMessage.Content), cancellationToken);

      agentRun.Model = result.Model;

      agentRun.Status = AgentRunStatus.Completed;

      agentRun.FinalReply = result.Reply;

      agentRun.CompletedAt = DateTime.UtcNow;

      foreach (var execution in result.ToolExecutions)
      {
        agentRun.ToolExecutions.Add(
            new AgentToolExecution
            {
              Id = Guid.NewGuid(),
              AgentRunId = agentRun.Id,
              ToolName = execution.ToolName,
              ArgumentsJson = execution.ArgumentsJson,
              ResultJson = execution.ResultJson,
              Success = execution.Success,
              Error = execution.Error,
              StartedAt = execution.StartedAt,
              CompletedAt = execution.CompletedAt
            });
      }

      await _agentRunRepository.SaveChangesAsync(cancellationToken);

      return new GenerateAgentReplyResponse(
          result.Reply,
          result.ToolsUsed,
          result.PendingActionIds);
    }
    catch (Exception ex)
    {
      agentRun.Status = AgentRunStatus.Failed;

      agentRun.Error = ex.Message;

      agentRun.CompletedAt = DateTime.UtcNow;

      await _agentRunRepository.SaveChangesAsync(cancellationToken);

      throw;
    }
  }
}
