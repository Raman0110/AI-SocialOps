using Microsoft.EntityFrameworkCore;
using Npgsql;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Customers.Application.Abstraction;
using SocialOps.Api.Features.Customers.Application.Abstractions;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.InboundWebhooks.Application.Dtos;
using SocialOps.Api.Features.SocialAccounts.Application.Abstractions;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.InboundWebhooks.Application.Services;

public sealed class InboundWebhookIngestionService
{
    private const string UniqueViolation = "23505";

    private readonly ISocialAccountRepository _socialAccountRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly ISocialIdentityRepository _socialIdentityRepository;
    private readonly IConversationRepository _conversationRepository;
    private readonly IMessageRepository _messageRepository;

    public InboundWebhookIngestionService(
        ISocialAccountRepository socialAccountRepository,
        ICustomerRepository customerRepository,
        ISocialIdentityRepository socialIdentityRepository,
        IConversationRepository conversationRepository,
        IMessageRepository messageRepository)
    {
        _socialAccountRepository = socialAccountRepository;
        _customerRepository = customerRepository;
        _socialIdentityRepository = socialIdentityRepository;
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
    }

    public async Task<InboundWebhookResponse> IngestAsync(
        NormalizedInboundMessage inboundMessage,
        CancellationToken cancellationToken = default)
    {
        var duplicate = await _messageRepository.GetByExternalMessageIdAsync(
            inboundMessage.ExternalMessageId,
            cancellationToken);

        if (duplicate is not null)
        {
            return new InboundWebhookResponse(
                true,
                true,
                duplicate.Conversation.OrganizationId,
                duplicate.ConversationId,
                duplicate.Id);
        }

        var socialAccount = await _socialAccountRepository.GetByExternalAccountAsync(
            inboundMessage.Platform,
            inboundMessage.ExternalAccountId,
            cancellationToken);

        if (socialAccount is null)
        {
            throw new ResourceNotFoundException("Social account does not exist for this webhook account.");
        }

        if (!socialAccount.IsActive)
        {
            throw new BusinessRuleException("Social account is not active.");
        }

        var socialIdentity = await _socialIdentityRepository.GetByPlatformAndExternalUserIdAsync(
            inboundMessage.Platform,
            inboundMessage.ExternalUserId,
            cancellationToken);

        if (socialIdentity is null)
        {
            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                OrganizationId = socialAccount.OrganizationId,
                Name = inboundMessage.Username,
                CreatedAt = DateTime.UtcNow
            };

            socialIdentity = new SocialIdentity
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                Platform = inboundMessage.Platform,
                ExternalUserId = inboundMessage.ExternalUserId,
                Username = inboundMessage.Username,
                CreatedAt = DateTime.UtcNow
            };

            await _customerRepository.AddAsync(customer, cancellationToken);
            await _socialIdentityRepository.AddAsync(socialIdentity, cancellationToken);
        }

        var conversation = await _conversationRepository.GetExistingAsync(
            socialAccount.Id,
            socialIdentity.Id,
            inboundMessage.ExternalConversationId,
            cancellationToken);

        if (conversation is null)
        {
            conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                OrganizationId = socialAccount.OrganizationId,
                CustomerId = socialIdentity.CustomerId,
                SocialIdentityId = socialIdentity.Id,
                SocialAccountId = socialAccount.Id,
                ExternalConversationId = inboundMessage.ExternalConversationId,
                Status = ConversationStatus.Open,
                CreatedAt = DateTime.UtcNow
            };

            await _conversationRepository.AddAsync(conversation, cancellationToken);
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Direction = MessageDirection.Inbound,
            SenderType = MessageSenderType.Customer,
            Content = inboundMessage.Text,
            ExternalMessageId = inboundMessage.ExternalMessageId,
            SentAt = inboundMessage.SentAt
        };

        await _messageRepository.AddAsync(message, cancellationToken);
        conversation.LastMessageAt = inboundMessage.SentAt;

        try
        {
            await _messageRepository.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsDuplicateExternalMessage(ex))
        {
            return new InboundWebhookResponse(
                true,
                true,
                socialAccount.OrganizationId,
                conversation.Id,
                null);
        }

        return new InboundWebhookResponse(
            true,
            false,
            socialAccount.OrganizationId,
            conversation.Id,
            message.Id);
    }

    private static bool IsDuplicateExternalMessage(DbUpdateException exception)
    {
        return exception.InnerException is PostgresException
        {
            SqlState: UniqueViolation,
            ConstraintName: "IX_messages_ExternalMessageId"
        };
    }
}
