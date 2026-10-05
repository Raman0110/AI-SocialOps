using SocialOps.Api.Features.InboundWebhooks.Application.Dtos;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.InboundWebhooks.Application.Abstractions;

public interface IInboundWebhookAdapter<in TPayload>
{
    SocialPlatform Platform { get; }

    NormalizedInboundMessage Normalize(TPayload payload);
}
