using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using SocialOps.Api.Features.InboundWebhooks.Infrastructure;

namespace SocialOps.Api.Tests;

public sealed class InstagramWebhookTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public InstagramWebhookTests(ApiFactory factory)
    {
        _factory = factory;
    }

    // Seeded organization A owns the Instagram account "acct-a".
    private static string Delivery(string text, string mid, string sender = "cust-1", bool echo = false, string account = "acct-a")
    {
        return JsonSerializer.Serialize(new
        {
            @object = "instagram",
            entry = new[]
            {
                new
                {
                    id = account,
                    time = 1761500000000L,
                    messaging = new[]
                    {
                        new
                        {
                            sender = new { id = sender },
                            recipient = new { id = account },
                            timestamp = 1761500000000L,
                            message = new { mid, text, is_echo = echo }
                        }
                    }
                }
            }
        });
    }

    private async Task<HttpResponseMessage> PostAsync(string json, string? signature)
    {
        var client = await _factory.CreateClientWithKeyAsync(null);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        if (signature is not null)
        {
            content.Headers.Add("X-Hub-Signature-256", signature);
        }

        return await client.PostAsync("/api/webhooks/instagram", content);
    }

    private static string Sign(string json) =>
        InstagramWebhookSignature.Compute(Encoding.UTF8.GetBytes(json), ApiFactory.InstagramAppSecret);

    private async Task<List<JsonElement>> InboxAsync()
    {
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);
        var body = await client.GetStringAsync("/api/conversations");

        return JsonDocument.Parse(body).RootElement.EnumerateArray().ToList();
    }

    [Fact]
    public async Task Verification_returns_the_challenge_for_the_right_token()
    {
        var client = await _factory.CreateClientWithKeyAsync(null);

        var response = await client.GetAsync(
            $"/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token={ApiFactory.InstagramVerifyToken}&hub.challenge=12345");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("12345", await response.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData("subscribe", "wrong-token")]
    [InlineData("unsubscribe", ApiFactory.InstagramVerifyToken)]
    public async Task Verification_rejects_wrong_token_or_mode(string mode, string token)
    {
        var client = await _factory.CreateClientWithKeyAsync(null);

        var response = await client.GetAsync($"/api/webhooks/instagram?hub.mode={mode}&hub.verify_token={token}&hub.challenge=12345");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Delivery_without_a_signature_is_rejected_and_stores_nothing()
    {
        var json = Delivery("unsigned message", "mid-unsigned");

        var response = await PostAsync(json, null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.DoesNotContain(await InboxAsync(), x => x.GetProperty("lastMessage").GetString() == "unsigned message");
    }

    [Fact]
    public async Task Delivery_with_a_wrong_signature_is_rejected()
    {
        var json = Delivery("forged message", "mid-forged");
        var forged = InstagramWebhookSignature.Compute(Encoding.UTF8.GetBytes(json), "not-the-secret");

        var response = await PostAsync(json, forged);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.DoesNotContain(await InboxAsync(), x => x.GetProperty("lastMessage").GetString() == "forged message");
    }

    [Fact]
    public async Task Signature_must_match_the_exact_body()
    {
        var json = Delivery("original text", "mid-tampered");
        var signature = Sign(json);

        var response = await PostAsync(json.Replace("original text", "tampered text"), signature);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Signed_delivery_creates_a_conversation_visible_in_the_organizations_inbox()
    {
        var json = Delivery("Do you ship to Pokhara?", "mid-ok-1", sender: "cust-pokhara");

        var response = await PostAsync(json, Sign(json));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(await InboxAsync(), x => x.GetProperty("lastMessage").GetString() == "Do you ship to Pokhara?");
    }

    [Fact]
    public async Task Redelivery_of_the_same_message_is_stored_once()
    {
        var json = Delivery("only once please", "mid-dupe", sender: "cust-dupe");

        await PostAsync(json, Sign(json));
        var second = await PostAsync(json, Sign(json));

        Assert.Equal(HttpStatusCode.OK, second.StatusCode);

        var conversation = Assert.Single(await InboxAsync(), x => x.GetProperty("lastMessage").GetString() == "only once please");
        var client = await _factory.CreateClientWithKeyAsync(ApiFactory.KeyA);
        var details = JsonDocument.Parse(await client.GetStringAsync($"/api/conversations/{conversation.GetProperty("id").GetGuid()}"));
        var matches = details.RootElement.GetProperty("messages").EnumerateArray()
            .Count(m => m.GetProperty("content").GetString() == "only once please");

        Assert.Equal(1, matches);
    }

    [Fact]
    public async Task Echoes_of_our_own_replies_are_ignored()
    {
        var json = Delivery("our own reply echoed back", "mid-echo", sender: "acct-a", echo: true);

        var response = await PostAsync(json, Sign(json));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.DoesNotContain(await InboxAsync(), x => x.GetProperty("lastMessage").GetString() == "our own reply echoed back");
    }

    [Fact]
    public async Task Delivery_for_an_unknown_account_is_acknowledged_without_error()
    {
        var json = Delivery("hello", "mid-unknown", account: "someone-elses-account");

        var response = await PostAsync(json, Sign(json));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Malformed_json_with_a_valid_signature_is_a_bad_request()
    {
        const string json = "{ not json";

        var response = await PostAsync(json, Sign(json));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Events_without_text_are_ignored()
    {
        const string json = """{"object":"instagram","entry":[{"id":"acct-a","messaging":[{"sender":{"id":"cust-1"},"read":{"mid":"x"}}]}]}""";

        var response = await PostAsync(json, Sign(json));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(0, JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("received").GetInt32());
    }

    [Fact]
    public async Task Sandbox_webhook_is_disabled_unless_explicitly_enabled()
    {
        var client = await _factory.CreateClientWithKeyAsync(null);

        var response = await client.PostAsJsonAsync("/api/webhooks/instagram/sandbox", new
        {
            businessAccountId = "acct-a",
            senderId = "sandbox-user",
            conversationId = "sandbox-conv",
            messageId = "sandbox-msg",
            text = "sandbox hello"
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public void Parser_extracts_text_messages_and_skips_everything_else()
    {
        var json = """
        {"object":"instagram","entry":[{"id":"acct-a","messaging":[
          {"sender":{"id":"u1"},"timestamp":1761500000000,"message":{"mid":"m1","text":"  hi there  "}},
          {"sender":{"id":"u2"},"message":{"mid":"m2","text":"echo","is_echo":true}},
          {"sender":{"id":"u3"},"message":{"mid":"m3","attachments":[{"type":"image"}]}},
          {"sender":{"id":"acct-a"},"message":{"mid":"m4","text":"from ourselves"}}
        ]}]}
        """;

        var message = Assert.Single(InstagramWebhookParser.Parse(json));

        Assert.Equal("acct-a", message.ExternalAccountId);
        Assert.Equal("u1", message.ExternalUserId);
        Assert.Equal("acct-a:u1", message.ExternalConversationId);
        Assert.Equal("m1", message.ExternalMessageId);
        Assert.Equal("hi there", message.Text);
        Assert.Equal(DateTimeOffset.FromUnixTimeMilliseconds(1761500000000).UtcDateTime, message.SentAt);
    }
}
