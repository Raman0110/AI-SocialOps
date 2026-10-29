using System.Text.Json;
using SocialOps.Api.Features.AgentActions.Application.Abstractions;
using SocialOps.Api.Features.AgentActions.Application.CreateTicketProposal;
using SocialOps.Api.Features.Conversations.Application.Abstractions;
using SocialOps.Api.Features.Tickets.Domain;

namespace SocialOps.Api.Features.AgentActions.Application.Services.CreateTicketProposal;

public sealed class CreateTicketProposalService
{
  private readonly IConversationRepository _conversationRepository;
  private readonly IAgentActionRepository _actionRepository;

  public CreateTicketProposalService(
      IConversationRepository conversationRepository,
      IAgentActionRepository actionRepository)
  {
    _conversationRepository = conversationRepository;
    _actionRepository = actionRepository;
  }

  public async Task<Guid?> CreateAsync(Guid conversationId, Guid organizationId, CreateTicketProposalPayload payload, CancellationToken cancellationToken = default)
  {
    var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);

    if (conversation is null || conversation.OrganizationId != organizationId) return null;

    var action = new PendingAgentAction
    {
      Id = Guid.NewGuid(),
      OrganizationId = conversation.OrganizationId,
      ConversationId = conversation.Id,
      Type = AgentActionType.CreateSupportTicket,
      PayloadJson = JsonSerializer.Serialize(payload)
    };

    await _actionRepository.AddAsync(action, cancellationToken);

    await _actionRepository.SaveChangesAsync(cancellationToken);

    return action.Id;
  }
}