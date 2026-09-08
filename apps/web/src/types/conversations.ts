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

export type MessageDirection =
  | "Inbound"
  | "Outbound";

export type MessageSenderType =
  | "Customer"
  | "HumanAgent"
  | "AiAgent";

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