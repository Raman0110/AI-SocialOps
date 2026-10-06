using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Conversations.Infrastructure;
using SocialOps.Api.Features.Customers.Application.Abstraction;
using SocialOps.Api.Features.Customers.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Application.Abstractions;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Features.Conversations.Application.Services
{
    public class ConversationsService
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly ISocialAccountRepository _socialAccountRepository;
        private readonly ISocialIdentityRepository _socialIdentityRepository;

        public ConversationsService(
            IConversationRepository conversationRepository,
            ICustomerRepository customerRepository,
            ISocialIdentityRepository socialIdentityRepository,
            ISocialAccountRepository socialAccountRepository)
        {
            _conversationRepository = conversationRepository;
            _customerRepository = customerRepository;
            _socialIdentityRepository = socialIdentityRepository;
            _socialAccountRepository = socialAccountRepository;
        }

        public async Task<CreateConversationResponse> CreateAsync(CreateConversationRequest request, CancellationToken cancellationToken)
        {
            var customer = await _customerRepository.GetByIdAsync(request.CustomerId, cancellationToken);

            if (customer is null)
            {
                throw new ResourceNotFoundException("Customer does not exist.");
            }

            if (customer.OrganizationId != request.OrganizationId)
            {
                throw new BusinessRuleException("Customer does not belong to this organization.");
            }

            var socialIdentity = await _socialIdentityRepository.GetByIdAsync(request.SocialIdentityId, cancellationToken);

            if (socialIdentity is null)
            {
                throw new ResourceNotFoundException("Social identity does not exist.");
            }

            if (socialIdentity.CustomerId != customer.Id)
            {
                throw new BusinessRuleException("Social identity does not belong to this customer.");
            }

            var socialAccount = await _socialAccountRepository.GetByIdAsync(request.SocialAccountId, cancellationToken);

            if (socialAccount is null)
            {
                throw new ResourceNotFoundException("Social account does not exist.");
            }

            if (socialAccount.OrganizationId != request.OrganizationId)
            {
                throw new BusinessRuleException("Social account does not belong to this organization.");
            }

            if (socialIdentity.Platform != socialAccount.Platform)
            {
                throw new BusinessRuleException("Customer identity and company social account must use the same platform.");
            }

            var existing = await _conversationRepository.GetExistingAsync(
                request.SocialAccountId,
                request.SocialIdentityId,
                request.ExternalConversationId,
                cancellationToken);

            if (existing is not null)
            {
                throw new ConflictException("Conversation already exists.");
            }

            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                OrganizationId = request.OrganizationId,
                CustomerId = request.CustomerId,
                SocialIdentityId = request.SocialIdentityId,
                SocialAccountId = request.SocialAccountId,
                ExternalConversationId = request.ExternalConversationId?.Trim(),
                Status = ConversationStatus.Open,
                CreatedAt = DateTime.UtcNow
            };

            await _conversationRepository.AddAsync(conversation, cancellationToken);

            await _conversationRepository.SaveChangesAsync(cancellationToken);

            return new CreateConversationResponse(
                conversation.Id,
                conversation.OrganizationId,
                conversation.CustomerId,
                conversation.SocialIdentityId,
                conversation.SocialAccountId,
                conversation.Status,
                conversation.ExternalConversationId,
                conversation.CreatedAt);
        }

        public async Task<IReadOnlyList<GetInboxResponse>> GetAsync(Guid organizationId, CancellationToken cancellationToken = default)
        {
            var conversations = await _conversationRepository.GetInboxAsync(organizationId, cancellationToken);

            return conversations.Select(conversation =>
                {
                    var lastMessage = conversation.Messages
                        .OrderByDescending(x => x.SentAt)
                        .FirstOrDefault();

                    return new GetInboxResponse(
                        conversation.Id,
                        conversation.Customer.Name,
                        conversation.SocialIdentity.Platform,
                        conversation.SocialIdentity.Username,
                        conversation.SocialAccount.DisplayName,
                        conversation.Status,
                        lastMessage?.Content,
                        lastMessage?.SentAt
                    );
                })
                .ToList();
        }

        public async Task<GetConversationResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
        {
            var conversation = await _conversationRepository.GetByIdAsync(id, cancellationToken);

            if (conversation is null)
            {
                return null;
            }

            var messages = conversation.Messages
                .OrderBy(x => x.SentAt)
                .Select(x => new GetConversationMessageResponse(
                    x.Id,
                    x.Direction,
                    x.SenderType,
                    x.Content,
                    x.SentAt))
                .ToList();

            return new GetConversationResponse(
                conversation.Id,
                conversation.OrganizationId,
                conversation.Customer.Name,
                conversation.SocialIdentity.Platform,
                conversation.SocialIdentity.Username,
                conversation.SocialAccount.DisplayName,
                conversation.Status,
                messages
            );
        }

    }
}
