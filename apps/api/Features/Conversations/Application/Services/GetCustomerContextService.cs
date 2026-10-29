using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Conversations.Application.Dtos.GetCustomerContext;

namespace SocialOps.Api.Features.Conversations.Application.Services.GetCustomerContext;

public sealed class GetCustomerContextService
{
  private readonly IConversationRepository _conversationRepository;

  public GetCustomerContextService(IConversationRepository conversationRepository)
  {
    _conversationRepository = conversationRepository;
  }

  public async Task<GetCustomerContextResponse?> GetAsync(Guid conversationId, Guid organizationId, CancellationToken cancellationToken = default)
  {
    var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);

    if (conversation is null || conversation.OrganizationId != organizationId) return null;

    return new GetCustomerContextResponse(
        conversation.Customer.Id,
        conversation.Customer.Name,
        conversation.Customer.Email,
        conversation.Customer.PhoneNumber,
        conversation.SocialIdentity.Platform,
        conversation.SocialIdentity.Username,
        conversation.SocialAccount.DisplayName);
  }
}