using SocialOps.Api.Features.AI.Application.AnalyzeMessage.Dtos;
using SocialOps.Api.Features.AI.Application.GenerateReply.Dtos;
using SocialOps.Api.Features.AI.Application.RunAgent.Dtos;

namespace SocialOps.Api.Features.AI.Infrastructure
{
    public class AgentClient
    {
        public const string RetrySafeClientName = "AgentRetrySafe";
        public const string SingleAttemptClientName = "AgentSingleAttempt";
        private readonly IHttpClientFactory _httpClientFactory;

        public AgentClient(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<AnalyzeMessageResponse> AnalyzeMessageAsync(AnalyzeMessageRequest request, CancellationToken cancellationToken = default)
        {
            var client = _httpClientFactory.CreateClient(RetrySafeClientName);
            using var response = await client.PostAsJsonAsync("/agent/analyze-message", request, cancellationToken);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<AnalyzeMessageResponse>(cancellationToken);

            if (result is null) throw new InvalidOperationException("Agent returned an empty response.");

            return result;
        }

        public async Task<GenerateReplyResponse> GenerateReplyAsync(GenerateReplyRequest request, CancellationToken cancellationToken = default)
        {
            var client = _httpClientFactory.CreateClient(RetrySafeClientName);
            using var response = await client.PostAsJsonAsync("/agent/generate-reply", request, cancellationToken);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<GenerateReplyResponse>(cancellationToken);

            if (result is null) throw new InvalidOperationException("Agent returned an empty reply.");

            return result;
        }

        public async Task<RunAgentResponse> RunAgentAsync(RunAgentRequest request, CancellationToken cancellationToken = default)
        {
            var client = _httpClientFactory.CreateClient(SingleAttemptClientName);
            using var response = await client.PostAsJsonAsync("/agent/run", request, cancellationToken);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<RunAgentResponse>(cancellationToken);

            if (result is null) throw new InvalidOperationException("Agent returned an empty response.");

            return result;
        }
    }
}
