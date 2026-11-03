using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.OutboundMessages.Application.Abstractions;
using SocialOps.Api.Features.OutboundMessages.Application.Services;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.Conversations.Application.Services;

public sealed class MessageService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly OutboundMessageDispatcher _dispatcher;

    public MessageService(
        IConversationRepository conversationRepository,
        IMessageRepository messageRepository,
        OutboundMessageDispatcher dispatcher)
    {
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
        _dispatcher = dispatcher;
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
            throw new ResourceNotFoundException("Conversation does not exist.");
        }

        var externalMessageId = request.ExternalMessageId?.Trim();

        if (!string.IsNullOrWhiteSpace(externalMessageId))
        {
            var exists = await _messageRepository.ExistsByExternalMessageIdAsync(
                    externalMessageId,
                    cancellationToken);

            if (exists)
            {
                throw new ConflictException("Message already exists.");
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
            SentAt = sentAt,
            DeliveryStatus = request.Direction == MessageDirection.Outbound
                ? MessageDeliveryStatus.Pending
                : MessageDeliveryStatus.None
        };

        await _messageRepository.AddAsync(
            message,
            cancellationToken);

        conversation.LastMessageAt = sentAt;

        await _messageRepository.SaveChangesAsync(cancellationToken);

        if (message.DeliveryStatus == MessageDeliveryStatus.Pending)
        {
            await DeliverAsync(conversation, message, cancellationToken);
        }

        return ToResponse(message);
    }

    public async Task<MessageResponse> RetryDeliveryAsync(
        Guid conversationId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken)
            ?? throw new ResourceNotFoundException("Conversation does not exist.");

        var message = await _messageRepository.GetTrackedAsync(conversationId, messageId, cancellationToken)
            ?? throw new ResourceNotFoundException("Message does not exist.");

        if (message.Direction != MessageDirection.Outbound ||
            message.DeliveryStatus != MessageDeliveryStatus.Failed)
        {
            throw new BusinessRuleException("Only failed outbound messages can be retried.");
        }

        message.DeliveryStatus = MessageDeliveryStatus.Pending;
        message.DeliveryError = null;
        await _messageRepository.SaveChangesAsync(cancellationToken);

        await DeliverAsync(conversation, message, cancellationToken);

        return ToResponse(message);
    }

    // The message is already saved as Pending, so a crash here leaves a visible Pending row
    // rather than losing the reply; delivery problems are recorded as Failed.
    private async Task DeliverAsync(
        Conversation conversation,
        Message message,
        CancellationToken cancellationToken)
    {
        var result = await _dispatcher.SendAsync(
            conversation.SocialAccount.Platform,
            new OutboundMessage(
                conversation.SocialAccount.ExternalAccountId,
                conversation.SocialIdentity.ExternalUserId,
                conversation.ExternalConversationId,
                message.Content),
            cancellationToken);

        if (result.Success)
        {
            message.DeliveryStatus = MessageDeliveryStatus.Sent;
            message.DeliveryError = null;

            if (message.ExternalMessageId is null)
            {
                message.ExternalMessageId = result.ExternalMessageId;
            }
        }
        else
        {
            message.DeliveryStatus = MessageDeliveryStatus.Failed;
            message.DeliveryError = Truncate(result.Error ?? "Delivery failed.", 500);
        }

        await _messageRepository.SaveChangesAsync(cancellationToken);
    }

    private static string Truncate(string value, int maxLength)
    {
        return value.Length <= maxLength ? value : value[..maxLength];
    }

    private static MessageResponse ToResponse(Message message)
    {
        return new MessageResponse(
            message.Id,
            message.ConversationId,
            message.Direction,
            message.SenderType,
            message.Content,
            message.ExternalMessageId,
            message.SentAt,
            message.DeliveryStatus,
            message.DeliveryError);
    }
}
