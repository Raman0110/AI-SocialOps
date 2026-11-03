using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using SocialOps.Api.Features.OutboundMessages.Application.Abstractions;
using SocialOps.Api.Features.OutboundMessages.Application.Services;
using SocialOps.Api.Features.SocialAccounts.Domain;

namespace SocialOps.Api.Tests;

public sealed class OutboundMessageTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public OutboundMessageTests(ApiFactory factory)
    {
        _factory = factory;
        _factory.Sender.Reset();
    }

    private static object Reply(string text = "Thanks for reaching out!") => new
    {
        direction = "Outbound",
        senderType = "HumanAgent",
        content = text
    };

    private async Task<(HttpResponseMessage Response, JsonElement Body)> PostReplyAsync(
        HttpClient client,
        Guid conversationId,
        object? payload = null)
    {
        var response = await client.PostAsJsonAsync($"/api/conversations/{conversationId}/messages", payload ?? Reply());
        var json = await response.Content.ReadAsStringAsync();
        var body = string.IsNullOrWhiteSpace(json) ? default : JsonDocument.Parse(json).RootElement;

        return (response, body);
    }

    [Fact]
    public async Task Outbound_reply_is_sent_and_marked_sent()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var (response, body) = await PostReplyAsync(client, _factory.ConversationA);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Sent", body.GetProperty("deliveryStatus").GetString());
        Assert.StartsWith("fake-", body.GetProperty("externalMessageId").GetString());

        var sent = Assert.Single(_factory.Sender.Sent);
        Assert.Equal("acct-a", sent.ExternalAccountId);
        Assert.Equal("user-a", sent.RecipientExternalUserId);
        Assert.Equal("Thanks for reaching out!", sent.Text);
    }

    [Fact]
    public async Task Failed_delivery_is_recorded_on_the_message_and_does_not_fail_the_request()
    {
        _factory.Sender.Behavior = _ => OutboundSendResult.Failed("Recipient is outside the messaging window.");
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var (response, body) = await PostReplyAsync(client, _factory.ConversationA);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Failed", body.GetProperty("deliveryStatus").GetString());
        Assert.Equal("Recipient is outside the messaging window.", body.GetProperty("deliveryError").GetString());
    }

    [Fact]
    public async Task Sender_exception_is_recorded_as_failure_without_leaking_details()
    {
        _factory.Sender.Behavior = _ => throw new InvalidOperationException("token=secret-value");
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var (response, body) = await PostReplyAsync(client, _factory.ConversationA);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Failed", body.GetProperty("deliveryStatus").GetString());
        Assert.DoesNotContain("secret-value", body.GetProperty("deliveryError").GetString());
    }

    [Fact]
    public async Task Failed_message_can_be_retried_and_then_succeeds()
    {
        _factory.Sender.Behavior = _ => OutboundSendResult.Failed("temporary");
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);
        var (_, failed) = await PostReplyAsync(client, _factory.ConversationA);
        var messageId = failed.GetProperty("id").GetGuid();

        _factory.Sender.Behavior = null;
        var retry = await client.PostAsync($"/api/conversations/{_factory.ConversationA}/messages/{messageId}/retry", null);
        var body = JsonDocument.Parse(await retry.Content.ReadAsStringAsync()).RootElement;

        Assert.Equal(HttpStatusCode.OK, retry.StatusCode);
        Assert.Equal("Sent", body.GetProperty("deliveryStatus").GetString());
        Assert.Equal(JsonValueKind.Null, body.GetProperty("deliveryError").ValueKind);
    }

    [Fact]
    public async Task Sent_message_cannot_be_retried()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);
        var (_, sent) = await PostReplyAsync(client, _factory.ConversationA);
        var messageId = sent.GetProperty("id").GetGuid();
        _factory.Sender.Sent.Clear();

        var retry = await client.PostAsync($"/api/conversations/{_factory.ConversationA}/messages/{messageId}/retry", null);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, retry.StatusCode);
        Assert.Empty(_factory.Sender.Sent);
    }

    [Fact]
    public async Task Inbound_messages_are_not_sent_anywhere()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var (response, body) = await PostReplyAsync(client, _factory.ConversationA, new
        {
            direction = "Inbound",
            senderType = "Customer",
            content = "Hello"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("None", body.GetProperty("deliveryStatus").GetString());
        Assert.Empty(_factory.Sender.Sent);
    }

    [Fact]
    public async Task Cannot_send_into_another_organizations_conversation()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);

        var (response, _) = await PostReplyAsync(client, _factory.ConversationB);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Empty(_factory.Sender.Sent);
    }

    [Fact]
    public async Task Cannot_retry_in_another_organizations_conversation()
    {
        var clientB = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyB);
        _factory.Sender.Behavior = _ => OutboundSendResult.Failed("temporary");
        var (_, failed) = await PostReplyAsync(clientB, _factory.ConversationB);
        var messageId = failed.GetProperty("id").GetGuid();
        _factory.Sender.Reset();

        var clientA = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);
        var retry = await clientA.PostAsync($"/api/conversations/{_factory.ConversationB}/messages/{messageId}/retry", null);

        Assert.Equal(HttpStatusCode.Forbidden, retry.StatusCode);
        Assert.Empty(_factory.Sender.Sent);
    }

    [Fact]
    public async Task Viewer_cannot_send_replies()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.ViewerKeyA);

        var (response, _) = await PostReplyAsync(client, _factory.ConversationA);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Dispatcher_reports_failure_when_no_sender_is_configured_for_the_platform()
    {
        var dispatcher = new OutboundMessageDispatcher([], NullLogger<OutboundMessageDispatcher>.Instance);

        var result = await dispatcher.SendAsync(
            SocialPlatform.Instagram,
            new OutboundMessage("acct", "user", null, "hi"));

        Assert.False(result.Success);
        Assert.Contains("not configured", result.Error);
    }
}
