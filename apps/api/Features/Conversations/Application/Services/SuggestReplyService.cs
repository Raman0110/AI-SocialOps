using SocialOps.Api.Features.AI.Application.GenerateReply.Dtos;
using SocialOps.Api.Features.AI.Infrastructure;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos.SuggestReply;

namespace SocialOps.Api.Features.Conversations.Application.Services.SuggestReplyService;

public sealed class SuggestReplyService
{
  private readonly IConversationRepository _conversationRepository;
  private readonly AgentClient _agentClient;

  public SuggestReplyService(
      IConversationRepository conversationRepository,
      AgentClient agentClient)
  {
    _conversationRepository = conversationRepository;
    _agentClient = agentClient;
  }

  public async Task<SuggestReplyResponse?> GenerateAsync(Guid conversationId, CancellationToken cancellationToken = default)
  {
    var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);

    if (conversation is null) return null;

    if (conversation.Messages.Count == 0) return null;

    var messages = conversation.Messages
        .OrderBy(x => x.SentAt)
        .TakeLast(20)
        .Select(x => new GenerateReplyMessage(GetSender(x), x.Content))
        .ToList();

    var request = new GenerateReplyRequest(
            conversation.Customer.Name,
            conversation.SocialIdentity.Platform.ToString(),
            messages);

    var result = await _agentClient.GenerateReplyAsync(request, cancellationToken);

    return new SuggestReplyResponse(result.Reply);
  }

  private static string GetSender(Domain.Message message)
  {
    return message.SenderType switch
    {
      Domain.MessageSenderType.Customer => "Customer",

      Domain.MessageSenderType.HumanAgent => "Support Agent",

      Domain.MessageSenderType.AiAgent => "AI Draft",

      _ => "Unknown"
    };
  }
}