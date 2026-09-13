export type SocialPlatform =
  | "Instagram"
  | "Facebook"
  | "X"
  | "TikTok"
  | "WhatsApp";

export type ConversationStatus =
  | "Open"
  | "Pending"
  | "Resolved"
  | "Escalated";

export const MessageDirection = {
  Inbound: 1,
  Outbound: 2,
} as const;

export type MessageDirection =
  (typeof MessageDirection)[keyof typeof MessageDirection];

export const MessageSenderType = {
  Customer: 1,
  HumanAgent: 2,
  AiAgent: 3,
} as const;

export type MessageSenderType =
  (typeof MessageSenderType)[keyof typeof MessageSenderType];

export const MessageSenderTypeLabel: Record<MessageSenderType, string> = {
  [MessageSenderType.Customer]: "Customer",
  [MessageSenderType.HumanAgent]: "Human Agent",
  [MessageSenderType.AiAgent]: "AI Agent",
};

export interface InboxConversation {
  id: string;
  customerName: string;
  platform: SocialPlatform;
  username: string;
  socialAccountName: string;
  status: ConversationStatus;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

export interface ConversationMessage {
  id: string;
  direction: MessageDirection;
  senderType: MessageSenderType;
  content: string;
  sentAt: string;
}

export interface ConversationDetails {
  id: string;
  customerName: string;
  platform: SocialPlatform;
  username: string;
  socialAccountName: string;
  status: ConversationStatus;
  messages: ConversationMessage[];
}

export interface MessageAnalysis {
  intent: string;
  sentiment: string;
  priority: string;
  risk: string;
  confidence: number;
}
