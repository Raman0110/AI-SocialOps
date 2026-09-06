using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Domain;

namespace SocialOps.Api.Features.Conversations.Application.Services;

public sealed class AddMessageService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IMessageRepository _messageRepository;

    public AddMessageService(
        IConversationRepository conversationRepository,
        IMessageRepository messageRepository)
    {
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
    }

    public async Task<MessageResponse> AddAsync(
        Guid conversationId,
        AddMessageRequest request,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(
                conversationId,
                cancellationToken);

        if (conversation is null)
        {
            throw new InvalidOperationException("Conversation does not exist.");
        }

        var externalMessageId = request.ExternalMessageId?.Trim();

        if (!string.IsNullOrWhiteSpace(externalMessageId))
        {
            var exists = await _messageRepository.ExistsByExternalMessageIdAsync(
                    externalMessageId,
                    cancellationToken);

            if (exists)
            {
                throw new InvalidOperationException("Message already exists.");
            }
        }

        var sentAt = DateTime.UtcNow;

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            Direction = request.Direction,
            SenderType = request.SenderType,
            Content = request.Content.Trim(),
            ExternalMessageId = externalMessageId,
            SentAt = sentAt
        };

        await _messageRepository.AddAsync(
            message,
            cancellationToken);

        conversation.LastMessageAt = sentAt;

        await _messageRepository.SaveChangesAsync(cancellationToken);

        return new MessageResponse(
            message.Id,
            message.ConversationId,
            message.Direction,
            message.SenderType,
            message.Content,
            message.ExternalMessageId,
            message.SentAt);
    }
}