using SocialOps.Api.Features.Tickets.Domain;

namespace SocialOps.Api.Features.AgentActions.Application.CreateTicketProposal;

public sealed record CreateTicketProposalPayload(
    string Title,
    string Description,
    TicketPriority Priority
);