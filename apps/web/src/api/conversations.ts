import type {
  ConversationDetails,
  ConversationMessage,
  InboxConversation,
  MessageDirection,
  MessageSenderType,
} from "../types/conversations";
import { request } from "./client";

export async function getInbox(organizationId: string): Promise<InboxConversation[]> {
  return request<InboxConversation[]>({
    method: "GET",
    url: "/api/conversations",
    params: { organizationId },
  });
}

export async function getConversation(conversationId: string): Promise<ConversationDetails> {
  return request<ConversationDetails>({
    method: "GET",
    url: `/api/conversations/${conversationId}`,
  });
}

interface AddMessageRequest {
  direction: MessageDirection;
  senderType: MessageSenderType;
  content: string;
  externalMessageId: string | null;
}

export async function addMessage(conversationId: string, message: AddMessageRequest): Promise<ConversationMessage> {
  return request<ConversationMessage>({
    method: "POST",
    url: `/api/conversations/${conversationId}/messages`,
    data: message,
  });
}
