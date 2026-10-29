using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos;

namespace SocialOps.Api.Features.Conversations.Application.Services;

public sealed class GetConversationHistoryService
{
  private readonly IConversationRepository _conversationRepository;

  public GetConversationHistoryService(IConversationRepository conversationRepository)
  {
    _conversationRepository = conversationRepository;
  }

  public async Task<GetConversationHistoryResponse?> GetAsync(Guid conversationId, Guid organizationId, int limit = 20, CancellationToken cancellationToken = default)
  {
    var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);

    if (conversation is null || conversation.OrganizationId != organizationId) return null;

    var messages = conversation.Messages
        .OrderByDescending(x => x.SentAt)
        .Take(limit)
        .OrderBy(x => x.SentAt)
        .Select(x => new ConversationHistoryMessageResponse(
            GetSender(x),
            x.Content,
            x.SentAt))
        .ToList();

    return new GetConversationHistoryResponse(conversation.Id, messages);
  }

  private static string GetSender(Domain.Message message)
  {
    return message.SenderType switch
    {
      Domain.MessageSenderType.Customer => "Customer",

      Domain.MessageSenderType.HumanAgent => "SupportAgent",

      Domain.MessageSenderType.AiAgent => "AiAgent",

      _ => "Unknown"
    };
  }
}