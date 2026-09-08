import type {
  ConversationDetails,
  InboxConversation,
} from "../types/conversations";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function getInbox(organizationId: string): Promise<InboxConversation[]> {
  const response = await fetch(
    `${API_URL}/api/conversations?organizationId=${organizationId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load inbox.");
  }

  return response.json();
}

export async function getConversation(conversationId: string): Promise<ConversationDetails> {
  const response = await fetch(
    `${API_URL}/api/conversations/${conversationId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load conversation.");
  }

  return response.json();
}