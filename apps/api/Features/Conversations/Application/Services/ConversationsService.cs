using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Conversations.Infrastructure;
using SocialOps.Api.Features.Customers.Application.Abstraction;
using SocialOps.Api.Features.Customers.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Application.Abstractions;

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

        public async Task<ConversationResponse> CreateAsync(CreateConversationRequest request, CancellationToken cancellationToken) {
            var customer = await _customerRepository.GetByIdAsync(request.CustomerId, cancellationToken);
            
            if (customer is null)
            {
                throw new InvalidOperationException("Customer does not exist.");
            }

            if (customer.OrganizationId != request.OrganizationId)
            {
                throw new InvalidOperationException("Customer does not belong to this organization.");
            }

            var socialIdentity = await _socialIdentityRepository.GetByIdAsync(request.SocialIdentityId, cancellationToken);

            if (socialIdentity is null)
            {
                throw new InvalidOperationException("Social identity does not exist.");
            }

            if (socialIdentity.CustomerId != customer.Id)
            {
                throw new InvalidOperationException("Social identity does not belong to this customer.");
            }

            var socialAccount = await _socialAccountRepository.GetByIdAsync(request.SocialAccountId, cancellationToken);

            if (socialAccount is null)
            {
                throw new InvalidOperationException("Social account does not exist.");
            }

            if (socialAccount.OrganizationId != request.OrganizationId)
            {
                throw new InvalidOperationException("Social account does not belong to this organization.");
            }

            if (socialIdentity.Platform != socialAccount.Platform)
            {
                throw new InvalidOperationException("Customer identity and company social account must use the same platform.");
            }

            var existing = await _conversationRepository.GetExistingAsync(
                request.SocialAccountId,
                request.SocialIdentityId,
                request.ExternalConversationId,
                cancellationToken);

            if (existing is not null)
            {
                throw new InvalidOperationException("Conversation already exists.");
            }

            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                OrganizationId = request.OrganizationId,
                CustomerId = request.CustomerId,
                SocialIdentityId = request.SocialIdentityId,
                SocialAccountId = request.SocialAccountId,
                ExternalConversationId =
                    request.ExternalConversationId?.Trim(),
                Status = ConversationStatus.Open,
                CreatedAt = DateTime.UtcNow
            };

            await _conversationRepository.AddAsync(conversation, cancellationToken);

            await _conversationRepository.SaveChangesAsync(cancellationToken);

            return new ConversationResponse(
                conversation.Id,
                conversation.OrganizationId,
                conversation.CustomerId,
                conversation.SocialIdentityId,
                conversation.SocialAccountId,
                conversation.Status,
                conversation.ExternalConversationId,
                conversation.CreatedAt);
        }

    }
}
