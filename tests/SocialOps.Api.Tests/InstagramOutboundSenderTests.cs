using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using SocialOps.Api.Features.OutboundMessages.Application.Abstractions;
using SocialOps.Api.Features.OutboundMessages.Infrastructure;
using SocialOps.Api.Shared.Integrations;

namespace SocialOps.Api.Tests;

public sealed class InstagramOutboundSenderTests
{
    private const string Token = "super-secret-token-123";

    private sealed class StubHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _respond;

        public StubHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) => _respond = respond;

        public HttpRequestMessage? Request { get; private set; }

        public string? Body { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Request = request;
            Body = request.Content is null ? null : await request.Content.ReadAsStringAsync(cancellationToken);

            return _respond(request);
        }
    }

    private sealed class StubFactory : IHttpClientFactory
    {
        private readonly HttpMessageHandler _handler;

        public StubFactory(HttpMessageHandler handler) => _handler = handler;

        public HttpClient CreateClient(string name) => new(_handler, disposeHandler: false);
    }

    private static InstagramOutboundSender CreateSender(StubHandler handler, Dictionary<string, string>? tokens = null)
    {
        var options = new InstagramOptions
        {
            AccessTokens = tokens ?? new Dictionary<string, string> { ["acct-a"] = Token }
        };

        return new InstagramOutboundSender(
            new StubFactory(handler),
            Options.Create(options),
            NullLogger<InstagramOutboundSender>.Instance);
    }

    private static OutboundMessage Message(string text = "Hello!") => new("acct-a", "cust-1", null, text);

    private static HttpResponseMessage Json(HttpStatusCode status, string json) =>
        new(status) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    [Fact]
    public async Task Successful_send_posts_the_expected_request_and_returns_the_message_id()
    {
        var handler = new StubHandler(_ => Json(HttpStatusCode.OK, """{"recipient_id":"cust-1","message_id":"mid.abc"}"""));

        var result = await CreateSender(handler).SendAsync(Message("Thanks for your message"));

        Assert.True(result.Success);
        Assert.Equal("mid.abc", result.ExternalMessageId);
        Assert.Equal(HttpMethod.Post, handler.Request!.Method);
        Assert.Equal("https://graph.instagram.com/v21.0/acct-a/messages", handler.Request.RequestUri!.ToString());
        Assert.Equal("Bearer", handler.Request.Headers.Authorization!.Scheme);
        Assert.Equal(Token, handler.Request.Headers.Authorization.Parameter);
        Assert.DoesNotContain(Token, handler.Request.RequestUri.ToString());

        var body = JsonDocument.Parse(handler.Body!).RootElement;
        Assert.Equal("cust-1", body.GetProperty("recipient").GetProperty("id").GetString());
        Assert.Equal("Thanks for your message", body.GetProperty("message").GetProperty("text").GetString());
    }

    [Fact]
    public async Task Instagram_error_is_reported_with_its_reason_but_not_the_token()
    {
        var handler = new StubHandler(_ => Json(HttpStatusCode.BadRequest,
            """{"error":{"message":"This message is sent outside of allowed window.","type":"OAuthException","code":10}}"""));

        var result = await CreateSender(handler).SendAsync(Message());

        Assert.False(result.Success);
        Assert.Contains("outside of allowed window", result.Error);
        Assert.DoesNotContain(Token, result.Error);
    }

    [Fact]
    public async Task Expired_token_gets_a_reconnect_hint()
    {
        var handler = new StubHandler(_ => Json(HttpStatusCode.Unauthorized,
            """{"error":{"message":"Error validating access token","code":190}}"""));

        var result = await CreateSender(handler).SendAsync(Message());

        Assert.False(result.Success);
        Assert.Contains("Reconnect", result.Error);
    }

    [Fact]
    public async Task Non_json_error_response_still_fails_cleanly()
    {
        var handler = new StubHandler(_ => new HttpResponseMessage(HttpStatusCode.BadGateway) { Content = new StringContent("<html>bad gateway</html>") });

        var result = await CreateSender(handler).SendAsync(Message());

        Assert.False(result.Success);
        Assert.Contains("502", result.Error);
    }

    [Fact]
    public async Task Network_failure_is_reported_without_details()
    {
        var handler = new StubHandler(_ => throw new HttpRequestException($"connection to host failed, token {Token}"));

        var result = await CreateSender(handler).SendAsync(Message());

        Assert.False(result.Success);
        Assert.DoesNotContain(Token, result.Error);
        Assert.Contains("Could not reach Instagram", result.Error);
    }

    [Fact]
    public async Task Account_without_a_token_fails_without_calling_instagram()
    {
        var handler = new StubHandler(_ => Json(HttpStatusCode.OK, "{}"));

        var result = await CreateSender(handler, new Dictionary<string, string> { ["other-account"] = "x" }).SendAsync(Message());

        Assert.False(result.Success);
        Assert.Null(handler.Request);
        Assert.Contains("No Instagram access token", result.Error);
    }

    [Fact]
    public async Task Reply_over_the_instagram_size_limit_fails_without_calling_instagram()
    {
        var handler = new StubHandler(_ => Json(HttpStatusCode.OK, "{}"));

        var result = await CreateSender(handler).SendAsync(Message(new string('x', 1001)));

        Assert.False(result.Success);
        Assert.Null(handler.Request);
        Assert.Contains("too long", result.Error);
    }

    [Fact]
    public async Task Size_limit_counts_bytes_not_characters()
    {
        var handler = new StubHandler(_ => Json(HttpStatusCode.OK, "{}"));

        // 400 three-byte characters = 1200 bytes, although only 400 characters.
        var result = await CreateSender(handler).SendAsync(Message(new string('न', 400)));

        Assert.False(result.Success);
        Assert.Contains("too long", result.Error);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Blank_token_does_not_count_as_sending_configured(string token)
    {
        var options = new InstagramOptions { AccessTokens = new Dictionary<string, string> { ["unset"] = token } };

        Assert.False(options.SendingConfigured);
    }

    [Fact]
    public void A_real_token_counts_as_sending_configured()
    {
        var options = new InstagramOptions { AccessTokens = new Dictionary<string, string> { ["acct"] = "tok" } };

        Assert.True(options.SendingConfigured);
    }

    [Theory]
    [InlineData(null, "verify")]
    [InlineData("secret", null)]
    [InlineData("", "verify")]
    public void Webhooks_need_both_secret_and_verify_token(string? secret, string? verify)
    {
        var options = new InstagramOptions { AppSecret = secret, VerifyToken = verify };

        Assert.False(options.WebhooksConfigured);
    }
}
