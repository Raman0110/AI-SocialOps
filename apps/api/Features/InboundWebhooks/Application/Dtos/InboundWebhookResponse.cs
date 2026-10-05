namespace SocialOps.Api.Features.InboundWebhooks.Application.Dtos;

public sealed record InboundWebhookResponse(
    bool Accepted,
    bool Duplicate,
    Guid? OrganizationId,
    Guid? ConversationId,
    Guid? MessageId);
