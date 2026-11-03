using SocialOps.Api.Features.OutboundMessages.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Features.OutboundMessages.Application.Services;

public sealed class OutboundMessageDispatcher
{
    private readonly IEnumerable<IOutboundMessageSender> _senders;
    private readonly ILogger<OutboundMessageDispatcher> _logger;

    public OutboundMessageDispatcher(
        IEnumerable<IOutboundMessageSender> senders,
        ILogger<OutboundMessageDispatcher> logger)
    {
        _senders = senders;
        _logger = logger;
    }

    // Never throws for delivery problems: a failed send is a result to record on the message.
    public async Task<OutboundSendResult> SendAsync(
        SocialPlatform platform,
        OutboundMessage message,
        CancellationToken cancellationToken = default)
    {
        var sender = _senders.FirstOrDefault(x => x.Platform == platform);

        if (sender is null)
        {
            _logger.LogWarning("No outbound sender is configured for {Platform}.", platform);

            return OutboundSendResult.Failed($"Sending to {platform} is not configured.");
        }

        try
        {
            return await sender.SendAsync(message, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(exception, "Outbound sender for {Platform} threw.", platform);

            return OutboundSendResult.Failed("Sending failed unexpectedly. Try again.");
        }
    }
}
