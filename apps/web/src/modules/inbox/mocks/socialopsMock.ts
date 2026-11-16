import type { PendingAgentAction } from "../types/agentActions";
import type {
  ConversationDetails,
  InboxConversation,
  MessageAnalysis,
} from "../types/conversations";
import {
  MessageDirection,
  MessageSenderType,
} from "../types/conversations";
import type { AgentReplyResult } from "../../../api/ai";
import type { InboundWebhookResult } from "../../../api/webhooks";
import type { SandboxScenario } from "../../dashboard/types/sandboxScenarios";

const delay = (duration = 250) =>
  import.meta.env.MODE === "test"
    ? Promise.resolve()
    : new Promise((resolve) => window.setTimeout(resolve, duration));

const conversations: InboxConversation[] = [
  {
    id: "conv-maya",
    customerName: "Maya Sharma",
    platform: "Instagram",
    username: "maya.designs",
    socialAccountName: "UrbanThreads Instagram",
    status: "Open",
    lastMessage: "Do you ship to Kathmandu? I need this before Friday.",
    lastMessageAt: "2026-10-08T09:25:00Z",
  },
  {
    id: "conv-ravi",
    customerName: "Ravi Thapa",
    platform: "WhatsApp",
    username: "+977-9800000000",
    socialAccountName: "UrbanThreads WhatsApp",
    status: "Pending",
    lastMessage: "The jacket size was wrong. Can I exchange it?",
    lastMessageAt: "2026-10-08T08:40:00Z",
  },
  {
    id: "conv-sophia",
    customerName: "Sophia Lee",
    platform: "Facebook",
    username: "sophia.lee",
    socialAccountName: "UrbanThreads Facebook",
    status: "Escalated",
    lastMessage: "I have messaged three times and no one replied.",
    lastMessageAt: "2026-10-07T16:10:00Z",
  },
  {
    id: "conv-nima",
    customerName: "Nima Gurung",
    platform: "TikTok",
    username: "@nima.moves",
    socialAccountName: "UrbanThreads TikTok",
    status: "Resolved",
    lastMessage: "Perfect, thank you!",
    lastMessageAt: "2026-10-07T11:15:00Z",
  },
];

const details: Record<string, ConversationDetails> = {
  "conv-maya": {
    id: "conv-maya",
    customerName: "Maya Sharma",
    platform: "Instagram",
    username: "maya.designs",
    socialAccountName: "UrbanThreads Instagram",
    status: "Open",
    messages: [
      {
        id: "msg-maya-1",
        direction: MessageDirection.Inbound,
        senderType: MessageSenderType.Customer,
        content: "Hi, do you ship to Kathmandu?",
        sentAt: "2026-10-08T09:21:00Z",
      },
      {
        id: "msg-maya-2",
        direction: MessageDirection.Outbound,
        senderType: MessageSenderType.HumanAgent,
        content: "Yes, we do. Delivery usually takes two business days.",
        sentAt: "2026-10-08T09:23:00Z",
      },
      {
        id: "msg-maya-3",
        direction: MessageDirection.Inbound,
        senderType: MessageSenderType.Customer,
        content: "Great. I need this before Friday. Is express delivery available?",
        sentAt: "2026-10-08T09:25:00Z",
      },
    ],
  },
  "conv-ravi": {
    id: "conv-ravi",
    customerName: "Ravi Thapa",
    platform: "WhatsApp",
    username: "+977-9800000000",
    socialAccountName: "UrbanThreads WhatsApp",
    status: "Pending",
    messages: [
      {
        id: "msg-ravi-1",
        direction: MessageDirection.Inbound,
        senderType: MessageSenderType.Customer,
        content: "The jacket size was wrong. Can I exchange it?",
        sentAt: "2026-10-08T08:40:00Z",
      },
    ],
  },
  "conv-sophia": {
    id: "conv-sophia",
    customerName: "Sophia Lee",
    platform: "Facebook",
    username: "sophia.lee",
    socialAccountName: "UrbanThreads Facebook",
    status: "Escalated",
    messages: [
      {
        id: "msg-sophia-1",
        direction: MessageDirection.Inbound,
        senderType: MessageSenderType.Customer,
        content: "I have messaged three times and no one replied.",
        sentAt: "2026-10-07T16:10:00Z",
      },
    ],
  },
  "conv-nima": {
    id: "conv-nima",
    customerName: "Nima Gurung",
    platform: "TikTok",
    username: "@nima.moves",
    socialAccountName: "UrbanThreads TikTok",
    status: "Resolved",
    messages: [
      {
        id: "msg-nima-1",
        direction: MessageDirection.Inbound,
        senderType: MessageSenderType.Customer,
        content: "Perfect, thank you!",
        sentAt: "2026-10-07T11:15:00Z",
      },
    ],
  },
};

const analyses: Record<string, MessageAnalysis> = {
  "conv-maya": {
    messageId: "msg-maya-3",
    intent: "delivery_question",
    sentiment: "hopeful",
    priority: "medium",
    risk: "low",
    confidence: 0.91,
    analyzedAt: "2026-10-08T09:26:00Z",
  },
  "conv-ravi": {
    messageId: "msg-ravi-1",
    intent: "exchange_request",
    sentiment: "frustrated",
    priority: "high",
    risk: "medium",
    confidence: 0.88,
    analyzedAt: "2026-10-08T08:42:00Z",
  },
  "conv-sophia": {
    messageId: "msg-sophia-1",
    intent: "complaint",
    sentiment: "angry",
    priority: "urgent",
    risk: "high",
    confidence: 0.94,
    analyzedAt: "2026-10-07T16:12:00Z",
  },
};

let actions: Record<string, PendingAgentAction[]> = {
  "conv-ravi": [
    {
      id: "action-ravi-ticket",
      type: "CreateSupportTicket",
      payloadJson: JSON.stringify({
        title: "Exchange request for wrong jacket size",
        priority: "High",
        description:
          "Customer received the wrong jacket size and is asking for an exchange.",
      }),
      createdAt: "2026-10-08T08:43:00Z",
    },
  ],
  "conv-sophia": [
    {
      id: "action-sophia-ticket",
      type: "CreateSupportTicket",
      payloadJson: JSON.stringify({
        title: "Escalated complaint about delayed response",
        priority: "Urgent",
        description:
          "Customer says they contacted the brand multiple times without a response.",
      }),
      createdAt: "2026-10-07T16:13:00Z",
    },
  ],
};

export async function getMockInbox(): Promise<InboxConversation[]> {
  await delay();
  return [...conversations];
}

export async function launchMockSandboxScenario(
  scenario: SandboxScenario,
): Promise<InboundWebhookResult> {
  await delay(180);

  const conversationId = `scenario-${scenario.id}`;
  const messageId = `scenario-message-${scenario.id}-${Date.now()}`;
  const sentAt = new Date().toISOString();
  const existingConversation = conversations.find(({ id }) => id === conversationId);

  if (existingConversation) {
    existingConversation.lastMessage = scenario.message;
    existingConversation.lastMessageAt = sentAt;
  } else {
    conversations.unshift({
      id: conversationId,
      customerName: scenario.senderUsername
        .split(".")
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(" "),
      platform: "Instagram",
      username: scenario.senderUsername,
      socialAccountName: "UrbanThreads Instagram",
      status: "Open",
      lastMessage: scenario.message,
      lastMessageAt: sentAt,
    });
  }

  details[conversationId] = {
    id: conversationId,
    customerName: conversations.find(({ id }) => id === conversationId)?.customerName ?? scenario.senderUsername,
    platform: "Instagram",
    username: scenario.senderUsername,
    socialAccountName: "UrbanThreads Instagram",
    status: "Open",
    messages: [
      {
        id: messageId,
        direction: MessageDirection.Inbound,
        senderType: MessageSenderType.Customer,
        content: scenario.message,
        sentAt,
      },
    ],
  };

  return {
    accepted: true,
    duplicate: false,
    organizationId: "mock-organization",
    conversationId,
    messageId,
  };
}

export async function getMockConversation(conversationId: string): Promise<ConversationDetails> {
  await delay();
  const conversation = details[conversationId];

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  return {
    ...conversation,
    messages: [...conversation.messages],
  };
}

export async function addMockMessage(
  conversationId: string,
  content: string
): Promise<ConversationDetails> {
  await delay(180);
  const conversation = details[conversationId];

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  conversation.messages.push({
    id: `msg-${conversationId}-${conversation.messages.length + 1}`,
    direction: MessageDirection.Outbound,
    senderType: MessageSenderType.HumanAgent,
    content,
    sentAt: new Date().toISOString(),
  });

  const summary = conversations.find((item) => item.id === conversationId);

  if (summary) {
    summary.lastMessage = content;
    summary.lastMessageAt = new Date().toISOString();
  }

  return getMockConversation(conversationId);
}

export async function analyzeMockConversation(
  conversationId: string
): Promise<MessageAnalysis> {
  await delay(450);
  return analyses[conversationId] ?? {
    messageId: `${conversationId}-latest`,
    intent: "general_question",
    sentiment: "neutral",
    priority: "normal",
    risk: "low",
    confidence: 0.76,
    analyzedAt: new Date().toISOString(),
  };
}

export async function generateMockAgentReply(
  conversationId: string
): Promise<AgentReplyResult> {
  await delay(600);

  const replyByConversation: Record<string, string> = {
    "conv-maya":
      "Yes, express delivery is available for Kathmandu. If you place the order today, we can prioritize dispatch and share the tracking link right away.",
    "conv-ravi":
      "I am sorry about the size issue. We can arrange an exchange for you. Please share your order number and preferred size, and I will get this moving.",
    "conv-sophia":
      "I am really sorry we kept you waiting. I am escalating this now and will make sure a support owner follows up with the next step today.",
  };

  if (!actions[conversationId] && conversationId !== "conv-maya") {
    actions = {
      ...actions,
      [conversationId]: [],
    };
  }

  return {
    reply:
      replyByConversation[conversationId] ??
      "Thanks for reaching out. I can help with that. Could you share a little more detail so I can point you in the right direction?",
    toolsUsed: ["get_customer_context", "get_conversation_history"],
    pendingActionIds: actions[conversationId]?.map((action) => action.id) ?? [],
  };
}

export async function getMockPendingActions(
  conversationId: string
): Promise<PendingAgentAction[]> {
  await delay(200);
  return [...(actions[conversationId] ?? [])];
}

export async function resolveMockPendingAction(actionId: string): Promise<void> {
  await delay(180);

  actions = Object.fromEntries(
    Object.entries(actions).map(([conversationId, conversationActions]) => [
      conversationId,
      conversationActions.filter((action) => action.id !== actionId),
    ])
  );
}
