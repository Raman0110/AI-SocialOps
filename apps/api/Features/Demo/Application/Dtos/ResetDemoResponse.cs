namespace SocialOps.Api.Features.Demo.Application.Dtos;

public sealed record ResetDemoResponse(
    Guid OrganizationId,
    string OrganizationName,
    int Customers,
    int Conversations,
    int KnowledgeEntries,
    DateTime ResetAtUtc);
