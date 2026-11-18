using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using SocialOps.Api.Features.AgentRuns.Domain;
using SocialOps.Api.Features.Conversations.Domain;
using SocialOps.Api.Features.Customers.Domain;
using SocialOps.Api.Features.Knowledge.Domain;
using SocialOps.Api.Features.Identity.Application.Services;
using SocialOps.Api.Features.Identity.Domain;
using SocialOps.Api.Features.Organizations.Domain;
using SocialOps.Api.Features.SocialAccounts.Domain;
using SocialOps.Api.Features.Tickets.Domain;

namespace SocialOps.Api.Shared.Data;

public static class DevelopmentDataSeeder
{
    public static readonly Guid OrganizationId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    public static readonly Guid OwnerUserId = Guid.Parse("01000000-0000-0000-0000-000000000001");
    public static readonly Guid OwnerMembershipId = Guid.Parse("02000000-0000-0000-0000-000000000001");
    public const string OwnerEmail = "owner@urbanthreads.local";
    public const string OwnerPassword = "ChangeMe123!";

    public static async Task SeedAsync(SocialOpsDbContext dbContext, CancellationToken cancellationToken = default)
    {
        if (await dbContext.Organizations.AnyAsync(organization => organization.Id == OrganizationId, cancellationToken))
        {
            await SeedIdentityAsync(dbContext, cancellationToken);
            await SeedConversationMessagesAsync(dbContext, cancellationToken);
            await SeedKnowledgeEntriesAsync(dbContext, cancellationToken);
            return;
        }

        var organization = new Organization
        {
            Id = OrganizationId,
            Name = "UrbanThreads",
            CreatedAt = Utc(2026, 8, 29, 8, 0)
        };

        var owner = CreateOwner(organization);

        var instagram = CreateAccount(
            "10000000-0000-0000-0000-000000000001",
            organization,
            SocialPlatform.Instagram,
            "ig_17841400000000991",
            "UrbanThreads Instagram");
        var whatsapp = CreateAccount(
            "10000000-0000-0000-0000-000000000002",
            organization,
            SocialPlatform.WhatsApp,
            "wa_9779800000000",
            "UrbanThreads WhatsApp");
        var facebook = CreateAccount(
            "10000000-0000-0000-0000-000000000003",
            organization,
            SocialPlatform.Facebook,
            "fb_102030405060",
            "UrbanThreads Facebook");
        var tiktok = CreateAccount(
            "10000000-0000-0000-0000-000000000004",
            organization,
            SocialPlatform.TikTok,
            "tt_704500000099",
            "UrbanThreads TikTok");

        var maya = CreateCustomer(
            "20000000-0000-0000-0000-000000000001",
            organization,
            "Maya Sharma",
            "maya.sharma@example.com",
            "+977-9801000001");
        var ravi = CreateCustomer(
            "20000000-0000-0000-0000-000000000002",
            organization,
            "Ravi Thapa",
            "ravi.thapa@example.com",
            "+977-9800000000");
        var sophia = CreateCustomer(
            "20000000-0000-0000-0000-000000000003",
            organization,
            "Sophia Lee",
            "sophia.lee@example.com",
            null);
        var nima = CreateCustomer(
            "20000000-0000-0000-0000-000000000004",
            organization,
            "Nima Gurung",
            "nima.gurung@example.com",
            null);

        var mayaIdentity = CreateIdentity(
            "30000000-0000-0000-0000-000000000001",
            maya,
            SocialPlatform.Instagram,
            "ig_178414000000001",
            "maya.designs");
        var raviIdentity = CreateIdentity(
            "30000000-0000-0000-0000-000000000002",
            ravi,
            SocialPlatform.WhatsApp,
            "wa_9779800000000",
            "+977-9800000000");
        var sophiaIdentity = CreateIdentity(
            "30000000-0000-0000-0000-000000000003",
            sophia,
            SocialPlatform.Facebook,
            "fb_102030405060",
            "sophia.lee");
        var nimaIdentity = CreateIdentity(
            "30000000-0000-0000-0000-000000000004",
            nima,
            SocialPlatform.TikTok,
            "tt_704500000001",
            "@nima.moves");

        var mayaConversation = CreateConversation(
            "40000000-0000-0000-0000-000000000001",
            organization,
            maya,
            instagram,
            mayaIdentity,
            ConversationStatus.Open,
            "instagram-conversation-maya",
            Utc(2026, 10, 8, 9, 25));
        var raviConversation = CreateConversation(
            "40000000-0000-0000-0000-000000000002",
            organization,
            ravi,
            whatsapp,
            raviIdentity,
            ConversationStatus.Pending,
            "whatsapp-conversation-ravi",
            Utc(2026, 10, 8, 8, 40));
        var sophiaConversation = CreateConversation(
            "40000000-0000-0000-0000-000000000003",
            organization,
            sophia,
            facebook,
            sophiaIdentity,
            ConversationStatus.Escalated,
            "facebook-conversation-sophia",
            Utc(2026, 10, 7, 16, 10));
        var nimaConversation = CreateConversation(
            "40000000-0000-0000-0000-000000000004",
            organization,
            nima,
            tiktok,
            nimaIdentity,
            ConversationStatus.Resolved,
            "tiktok-conversation-nima",
            Utc(2026, 10, 7, 11, 15));

        AddMessage(
            "50000000-0000-0000-0000-000000000001",
            mayaConversation,
            MessageDirection.Inbound,
            MessageSenderType.Customer,
            "Hi, do you ship to Kathmandu?",
            Utc(2026, 10, 8, 9, 21));
        AddMessage(
            "50000000-0000-0000-0000-000000000002",
            mayaConversation,
            MessageDirection.Outbound,
            MessageSenderType.HumanAgent,
            "Yes, we do. Delivery usually takes two business days.",
            Utc(2026, 10, 8, 9, 23));
        var mayaLatestMessage = AddMessage(
            "50000000-0000-0000-0000-000000000003",
            mayaConversation,
            MessageDirection.Inbound,
            MessageSenderType.Customer,
            "Great. I need this before Friday. Is express delivery available?",
            Utc(2026, 10, 8, 9, 25));
        var raviMessage = AddMessage(
            "50000000-0000-0000-0000-000000000004",
            raviConversation,
            MessageDirection.Inbound,
            MessageSenderType.Customer,
            "The jacket size was wrong. Can I exchange it?",
            Utc(2026, 10, 8, 8, 40));
        var sophiaMessage = AddMessage(
            "50000000-0000-0000-0000-000000000005",
            sophiaConversation,
            MessageDirection.Inbound,
            MessageSenderType.Customer,
            "I have messaged three times and no one replied.",
            Utc(2026, 10, 7, 16, 10));
        AddMessage(
            "50000000-0000-0000-0000-000000000006",
            nimaConversation,
            MessageDirection.Inbound,
            MessageSenderType.Customer,
            "Perfect, thank you!",
            Utc(2026, 10, 7, 11, 15));

        AddAnalysis(
            "60000000-0000-0000-0000-000000000001",
            mayaLatestMessage,
            "delivery_question",
            "hopeful",
            "medium",
            "low",
            0.91,
            Utc(2026, 10, 8, 9, 26));
        AddAnalysis(
            "60000000-0000-0000-0000-000000000002",
            raviMessage,
            "exchange_request",
            "frustrated",
            "high",
            "medium",
            0.88,
            Utc(2026, 10, 8, 8, 42));
        AddAnalysis(
            "60000000-0000-0000-0000-000000000003",
            sophiaMessage,
            "complaint",
            "angry",
            "urgent",
            "high",
            0.94,
            Utc(2026, 10, 7, 16, 12));

        dbContext.PendingAgentActions.AddRange(
            CreateTicketAction(
                "70000000-0000-0000-0000-000000000001",
                organization.Id,
                raviConversation.Id,
                "Exchange request for wrong jacket size",
                "Customer received the wrong jacket size and is asking for an exchange.",
                "High",
                Utc(2026, 10, 8, 8, 43)),
            CreateTicketAction(
                "70000000-0000-0000-0000-000000000002",
                organization.Id,
                sophiaConversation.Id,
                "Escalated complaint about delayed response",
                "Customer says they contacted the brand multiple times without a response.",
                "Urgent",
                Utc(2026, 10, 7, 16, 13)));

        var agentRun = new AgentRun
        {
            Id = Guid.Parse("80000000-0000-0000-0000-000000000001"),
            OrganizationId = organization.Id,
            ConversationId = mayaConversation.Id,
            InputMessageId = mayaLatestMessage.Id,
            Status = AgentRunStatus.Completed,
            Model = "llama-3.3-70b-versatile",
            FinalReply = "Yes, express delivery is available for Kathmandu.",
            StartedAt = Utc(2026, 10, 8, 9, 26),
            CompletedAt = Utc(2026, 10, 8, 9, 26).AddSeconds(2)
        };
        agentRun.ToolExecutions.Add(new AgentToolExecution
        {
            Id = Guid.Parse("90000000-0000-0000-0000-000000000001"),
            AgentRun = agentRun,
            ToolName = "get_customer_context",
            ArgumentsJson = $$"""{"conversation_id":"{{mayaConversation.Id}}"}""",
            ResultJson = """{"customer_name":"Maya Sharma","platform":"Instagram"}""",
            Success = true,
            StartedAt = Utc(2026, 10, 8, 9, 26),
            CompletedAt = Utc(2026, 10, 8, 9, 26).AddMilliseconds(340)
        });

        dbContext.Organizations.Add(organization);
        dbContext.Users.Add(owner);
        dbContext.AgentRuns.Add(agentRun);

        await dbContext.SaveChangesAsync(cancellationToken);
        await SeedConversationMessagesAsync(dbContext, cancellationToken);
        await SeedKnowledgeEntriesAsync(dbContext, cancellationToken);
    }

    private static SocialAccount CreateAccount(
        string id,
        Organization organization,
        SocialPlatform platform,
        string externalAccountId,
        string displayName)
    {
        var account = new SocialAccount
        {
            Id = Guid.Parse(id),
            Organization = organization,
            Platform = platform,
            ExternalAccountId = externalAccountId,
            DisplayName = displayName,
            IsActive = true,
            CreatedAt = Utc(2026, 9, 1, 8, 0)
        };
        organization.SocialAccounts.Add(account);
        return account;
    }

    private static User CreateOwner(Organization organization)
    {
        var user = new User
        {
            Id = OwnerUserId,
            Name = "Development Owner",
            Email = OwnerEmail,
            NormalizedEmail = AuthService.NormalizeEmail(OwnerEmail),
            PasswordHash = string.Empty,
            CreatedAt = Utc(2026, 8, 29, 8, 0)
        };
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, OwnerPassword);
        user.Memberships.Add(new OrganizationMembership
        {
            Id = OwnerMembershipId,
            User = user,
            Organization = organization,
            Role = MembershipRole.Owner,
            CreatedAt = Utc(2026, 8, 29, 8, 0)
        });

        return user;
    }

    private static async Task SeedIdentityAsync(
        SocialOpsDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .Include(x => x.Memberships)
            .SingleOrDefaultAsync(x => x.Id == OwnerUserId, cancellationToken);

        if (user is null)
        {
            var organization = await dbContext.Organizations
                .SingleAsync(x => x.Id == OrganizationId, cancellationToken);
            dbContext.Users.Add(CreateOwner(organization));
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        if (user.Memberships.All(x => x.OrganizationId != OrganizationId))
        {
            dbContext.OrganizationMemberships.Add(new OrganizationMembership
            {
                Id = OwnerMembershipId,
                UserId = user.Id,
                OrganizationId = OrganizationId,
                Role = MembershipRole.Owner,
                CreatedAt = Utc(2026, 8, 29, 8, 0)
            });
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static Customer CreateCustomer(
        string id,
        Organization organization,
        string name,
        string email,
        string? phoneNumber)
    {
        var customer = new Customer
        {
            Id = Guid.Parse(id),
            Organization = organization,
            Name = name,
            Email = email,
            PhoneNumber = phoneNumber,
            CreatedAt = Utc(2026, 9, 1, 8, 0)
        };
        organization.Customers.Add(customer);
        return customer;
    }

    private static SocialIdentity CreateIdentity(
        string id,
        Customer customer,
        SocialPlatform platform,
        string externalUserId,
        string username)
    {
        var identity = new SocialIdentity
        {
            Id = Guid.Parse(id),
            Customer = customer,
            Platform = platform,
            ExternalUserId = externalUserId,
            Username = username,
            CreatedAt = Utc(2026, 9, 1, 8, 0)
        };
        customer.SocialIdentities.Add(identity);
        return identity;
    }

    private static Conversation CreateConversation(
        string id,
        Organization organization,
        Customer customer,
        SocialAccount socialAccount,
        SocialIdentity socialIdentity,
        ConversationStatus status,
        string externalConversationId,
        DateTime lastMessageAt)
    {
        var conversation = new Conversation
        {
            Id = Guid.Parse(id),
            Organization = organization,
            Customer = customer,
            SocialAccount = socialAccount,
            SocialIdentity = socialIdentity,
            Status = status,
            ExternalConversationId = externalConversationId,
            CreatedAt = lastMessageAt.AddMinutes(-10),
            LastMessageAt = lastMessageAt
        };
        organization.Conversations.Add(conversation);
        customer.Conversations.Add(conversation);
        socialAccount.Conversations.Add(conversation);
        return conversation;
    }

    private static Message AddMessage(
        string id,
        Conversation conversation,
        MessageDirection direction,
        MessageSenderType senderType,
        string content,
        DateTime sentAt)
    {
        var message = new Message
        {
            Id = Guid.Parse(id),
            Conversation = conversation,
            Direction = direction,
            SenderType = senderType,
            Content = content,
            ExternalMessageId = $"seed-{id}",
            SentAt = sentAt
        };
        conversation.Messages.Add(message);
        return message;
    }

    private static void AddAnalysis(
        string id,
        Message message,
        string intent,
        string sentiment,
        string priority,
        string risk,
        double confidence,
        DateTime analyzedAt)
    {
        message.Analysis = new MessageAnalysis
        {
            Id = Guid.Parse(id),
            Message = message,
            Intent = intent,
            Sentiment = sentiment,
            Priority = priority,
            Risk = risk,
            Confidence = confidence,
            Model = "seed-data",
            AnalyzedAt = analyzedAt
        };
    }

    private static PendingAgentAction CreateTicketAction(
        string id,
        Guid organizationId,
        Guid conversationId,
        string title,
        string description,
        string priority,
        DateTime createdAt) => new()
        {
            Id = Guid.Parse(id),
            OrganizationId = organizationId,
            ConversationId = conversationId,
            Type = AgentActionType.CreateSupportTicket,
            Status = AgentActionStatus.Pending,
            PayloadJson = $$"""{"title":"{{title}}","description":"{{description}}","priority":"{{priority}}"}""",
            CreatedAt = createdAt
        };

    private static async Task SeedConversationMessagesAsync(
        SocialOpsDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var messages = new[]
        {
            new SeedMessage(
                "50000000-0000-0000-0000-000000000101",
                "40000000-0000-0000-0000-000000000001",
                MessageDirection.Inbound,
                MessageSenderType.Customer,
                "Hi! I'm interested in the linen jacket from your latest post.",
                Utc(2026, 10, 8, 9, 18)),
            new SeedMessage(
                "50000000-0000-0000-0000-000000000102",
                "40000000-0000-0000-0000-000000000002",
                MessageDirection.Inbound,
                MessageSenderType.Customer,
                "Hi, I received my jacket today, but the size does not match my order.",
                Utc(2026, 10, 8, 8, 32)),
            new SeedMessage(
                "50000000-0000-0000-0000-000000000103",
                "40000000-0000-0000-0000-000000000002",
                MessageDirection.Outbound,
                MessageSenderType.HumanAgent,
                "I'm sorry about that. Could you share your order number and the size you received?",
                Utc(2026, 10, 8, 8, 36)),
            new SeedMessage(
                "50000000-0000-0000-0000-000000000104",
                "40000000-0000-0000-0000-000000000002",
                MessageDirection.Inbound,
                MessageSenderType.Customer,
                "It is order UT-4821. I ordered medium but received small.",
                Utc(2026, 10, 8, 8, 38)),
            new SeedMessage(
                "50000000-0000-0000-0000-000000000105",
                "40000000-0000-0000-0000-000000000003",
                MessageDirection.Inbound,
                MessageSenderType.Customer,
                "Hello, I need an update on order UT-4750.",
                Utc(2026, 10, 7, 15, 45)),
            new SeedMessage(
                "50000000-0000-0000-0000-000000000106",
                "40000000-0000-0000-0000-000000000003",
                MessageDirection.Inbound,
                MessageSenderType.Customer,
                "Is anyone available? I sent another message yesterday too.",
                Utc(2026, 10, 7, 16, 0)),
            new SeedMessage(
                "50000000-0000-0000-0000-000000000107",
                "40000000-0000-0000-0000-000000000004",
                MessageDirection.Inbound,
                MessageSenderType.Customer,
                "Is the black oversized hoodie still available in large?",
                Utc(2026, 10, 7, 11, 5)),
            new SeedMessage(
                "50000000-0000-0000-0000-000000000108",
                "40000000-0000-0000-0000-000000000004",
                MessageDirection.Outbound,
                MessageSenderType.HumanAgent,
                "Yes, it is in stock. You can order it through the link in our bio.",
                Utc(2026, 10, 7, 11, 12))
        };

        var messageIds = messages.Select(message => Guid.Parse(message.Id)).ToArray();
        var existingMessageIds = await dbContext.Messages
            .Where(message => messageIds.Contains(message.Id))
            .Select(message => message.Id)
            .ToHashSetAsync(cancellationToken);

        var missingMessages = messages
            .Where(message => !existingMessageIds.Contains(Guid.Parse(message.Id)))
            .Select(message => new Message
            {
                Id = Guid.Parse(message.Id),
                ConversationId = Guid.Parse(message.ConversationId),
                Direction = message.Direction,
                SenderType = message.SenderType,
                Content = message.Content,
                ExternalMessageId = $"seed-{message.Id}",
                SentAt = message.SentAt
            })
            .ToArray();

        if (missingMessages.Length == 0)
        {
            return;
        }

        dbContext.Messages.AddRange(missingMessages);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedKnowledgeEntriesAsync(
        SocialOpsDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var entries = new[]
        {
            new KnowledgeEntry
            {
                Id = Guid.Parse("a0000000-0000-0000-0000-000000000001"),
                OrganizationId = OrganizationId,
                Title = "Shipping and express delivery",
                Content = "UrbanThreads ships across Nepal. Standard delivery takes 2 to 4 business days. Express delivery is available inside Kathmandu Valley and usually arrives within 1 business day when an order is placed before 2 PM.",
                CreatedAt = Utc(2026, 10, 1, 8, 0)
            },
            new KnowledgeEntry
            {
                Id = Guid.Parse("a0000000-0000-0000-0000-000000000002"),
                OrganizationId = OrganizationId,
                Title = "Returns and exchanges",
                Content = "Unused items can be returned or exchanged within 7 days of delivery when they are in their original condition with tags attached. Refunds are returned to the original payment method within 5 business days after the item is received.",
                CreatedAt = Utc(2026, 10, 1, 8, 5)
            },
            new KnowledgeEntry
            {
                Id = Guid.Parse("a0000000-0000-0000-0000-000000000003"),
                OrganizationId = OrganizationId,
                Title = "Incorrect or damaged orders",
                Content = "If an item arrives damaged or does not match the order, apologize and ask for the order number plus a photo of the item. Escalate the conversation by proposing a high-priority support ticket. Do not promise a refund or replacement before a human reviews the case.",
                CreatedAt = Utc(2026, 10, 1, 8, 10)
            }
        };

        var entryIds = entries.Select(entry => entry.Id).ToArray();
        var existingIds = await dbContext.KnowledgeEntries
            .Where(entry => entryIds.Contains(entry.Id))
            .Select(entry => entry.Id)
            .ToHashSetAsync(cancellationToken);

        var missingEntries = entries.Where(entry => !existingIds.Contains(entry.Id)).ToArray();

        if (missingEntries.Length == 0)
        {
            return;
        }

        dbContext.KnowledgeEntries.AddRange(missingEntries);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private sealed record SeedMessage(
        string Id,
        string ConversationId,
        MessageDirection Direction,
        MessageSenderType SenderType,
        string Content,
        DateTime SentAt);

    private static DateTime Utc(int year, int month, int day, int hour, int minute) =>
        new(year, month, day, hour, minute, 0, DateTimeKind.Utc);
}
