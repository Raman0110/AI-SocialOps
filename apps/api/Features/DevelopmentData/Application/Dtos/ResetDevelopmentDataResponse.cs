namespace SocialOps.Api.Features.DevelopmentData.Application.Dtos;

public sealed record ResetDevelopmentDataResponse(
    Guid OrganizationId,
    string OrganizationName,
    int Customers,
    int Conversations,
    int KnowledgeEntries,
    DateTime ResetAtUtc);
