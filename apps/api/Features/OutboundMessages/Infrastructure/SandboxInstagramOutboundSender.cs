using SocialOps.Api.Features.OutboundMessages.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.OutboundMessages.Infrastructure;

// Development stand-in for the Instagram messaging API: reports success without sending anything.
public sealed class SandboxInstagramOutboundSender : IOutboundMessageSender
{
    private readonly ILogger<SandboxInstagramOutboundSender> _logger;

    public SandboxInstagramOutboundSender(ILogger<SandboxInstagramOutboundSender> logger)
    {
        _logger = logger;
    }

    public SocialPlatform Platform => SocialPlatform.Instagram;

    public Task<OutboundSendResult> SendAsync(OutboundMessage message, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Sandbox: pretending to send an Instagram message from {Account} to {Recipient}.",
            message.ExternalAccountId,
            message.RecipientExternalUserId);

        return Task.FromResult(OutboundSendResult.Sent($"sandbox-{Guid.NewGuid():N}"));
    }
}
