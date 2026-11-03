using SocialOps.Api.Features.OutboundMessages.Application.Abstractions;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Tests;

public sealed class FakeOutboundSender : IOutboundMessageSender
{
    private int _counter;

    public SocialPlatform Platform => SocialPlatform.Instagram;

    public List<OutboundMessage> Sent { get; } = [];

    public Func<OutboundMessage, OutboundSendResult>? Behavior { get; set; }

    public void Reset()
    {
        Sent.Clear();
        Behavior = null;
    }

    public Task<OutboundSendResult> SendAsync(OutboundMessage message, CancellationToken cancellationToken = default)
    {
        Sent.Add(message);

        var result = Behavior?.Invoke(message) ?? OutboundSendResult.Sent($"fake-{Interlocked.Increment(ref _counter)}");

        return Task.FromResult(result);
    }
}
