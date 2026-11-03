namespace SocialOps.Api.Features.Conversations.Domain;

public enum MessageDeliveryStatus
{
    // Inbound messages, and outbound messages stored before delivery tracking existed.
    None = 0,
    Pending = 1,
    Sent = 2,
    Failed = 3
}
