using SocialOps.Api.Features.AI.Application.AnalyzeMessage.Dtos;

namespace SocialOps.Api.Features.AI.Infrastructure
{
    public class AgentClient
    {
        private readonly HttpClient _httpClient;

        public AgentClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<AnalyzeMessageResponse> AnalyzeMessageAsync(AnalyzeMessageRequest request, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.PostAsJsonAsync("/agent/analyze-message", request, cancellationToken);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<AnalyzeMessageResponse>(cancellationToken);

            if (result is null) throw new InvalidOperationException("Agent returned an empty response.");

            return result;
        }
    }
}
