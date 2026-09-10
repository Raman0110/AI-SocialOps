import axios from "axios";

import type {
  ConversationDetails,
  ConversationMessage,
  InboxConversation,
  MessageDirection,
  MessageSenderType,
} from "../types/conversations";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getInbox(
  organizationId: string
): Promise<InboxConversation[]> {
  const response = await api.get<InboxConversation[]>(
    "/api/conversations",
    {
      params: {
        organizationId,
      },
    }
  );

  return response.data;
}

export async function getConversation(
  conversationId: string
): Promise<ConversationDetails> {
  const response = await api.get<ConversationDetails>(
    `/api/conversations/${conversationId}`
  );

  return response.data;
}

interface AddMessageRequest {
  direction: MessageDirection;
  senderType: MessageSenderType;
  content: string;
  externalMessageId: string | null;
}

export async function addMessage(
  conversationId: string,
  request: AddMessageRequest
): Promise<ConversationMessage> {
  const response = await api.post<ConversationMessage>(
    `/api/conversations/${conversationId}/messages`,
    request
  );

  return response.data;
}
