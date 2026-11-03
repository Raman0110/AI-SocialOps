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
  Inbound: "Inbound",
  Outbound: "Outbound",
} as const;

export type MessageDirection =
  (typeof MessageDirection)[keyof typeof MessageDirection];

export const MessageSenderType = {
  Customer: "Customer",
  HumanAgent: "HumanAgent",
  AiAgent: "AiAgent",
} as const;

export type MessageSenderType =
  (typeof MessageSenderType)[keyof typeof MessageSenderType];

export const MessageDeliveryStatus = {
  None: "None",
  Pending: "Pending",
  Sent: "Sent",
  Failed: "Failed",
} as const;

export type MessageDeliveryStatus =
  (typeof MessageDeliveryStatus)[keyof typeof MessageDeliveryStatus];

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
  // Absent for mock data and older API responses; treated as "None".
  deliveryStatus?: MessageDeliveryStatus;
  deliveryError?: string | null;
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
  messageId: string;
  intent: string;
  sentiment: string;
  priority: string;
  risk: string;
  confidence: number;
  analyzedAt: string;
}
