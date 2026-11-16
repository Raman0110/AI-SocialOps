using Microsoft.EntityFrameworkCore;
using SocialOps.Api.Features.DevelopmentData.Application.Dtos;
using SocialOps.Api.Shared.Data;

namespace SocialOps.Api.Features.DevelopmentData.Application.Services;

public sealed class DevelopmentDataResetService
{
    private readonly SocialOpsDbContext _dbContext;

    public DevelopmentDataResetService(SocialOpsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ResetDevelopmentDataResponse> ResetAsync(CancellationToken cancellationToken)
    {
        var organizationId = DevelopmentDataSeeder.OrganizationId;
        var conversationIds = _dbContext.Conversations
            .Where(conversation => conversation.OrganizationId == organizationId)
            .Select(conversation => conversation.Id);
        var messageIds = _dbContext.Messages
            .Where(message => conversationIds.Contains(message.ConversationId))
            .Select(message => message.Id);
        var agentRunIds = _dbContext.AgentRuns
            .Where(run => run.OrganizationId == organizationId)
            .Select(run => run.Id);
        var customerIds = _dbContext.Customers
            .Where(customer => customer.OrganizationId == organizationId)
            .Select(customer => customer.Id);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        await _dbContext.AgentToolExecutions
            .Where(execution => agentRunIds.Contains(execution.AgentRunId))
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.AgentRuns
            .Where(run => run.OrganizationId == organizationId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.MessageAnalyses
            .Where(analysis => messageIds.Contains(analysis.MessageId))
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.PendingAgentActions
            .Where(action => action.OrganizationId == organizationId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.SupportTickets
            .Where(ticket => ticket.OrganizationId == organizationId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.Messages
            .Where(message => conversationIds.Contains(message.ConversationId))
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.KnowledgeEntries
            .Where(entry => entry.OrganizationId == organizationId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.Conversations
            .Where(conversation => conversation.OrganizationId == organizationId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.SocialIdentities
            .Where(identity => customerIds.Contains(identity.CustomerId))
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.Customers
            .Where(customer => customer.OrganizationId == organizationId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.SocialAccounts
            .Where(account => account.OrganizationId == organizationId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.Organizations
            .Where(organization => organization.Id == organizationId)
            .ExecuteDeleteAsync(cancellationToken);

        await DevelopmentDataSeeder.SeedAsync(_dbContext, cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new ResetDevelopmentDataResponse(
            organizationId,
            "UrbanThreads",
            await _dbContext.Customers.CountAsync(customer => customer.OrganizationId == organizationId, cancellationToken),
            await _dbContext.Conversations.CountAsync(conversation => conversation.OrganizationId == organizationId, cancellationToken),
            await _dbContext.KnowledgeEntries.CountAsync(entry => entry.OrganizationId == organizationId, cancellationToken),
            DateTime.UtcNow);
    }
}
