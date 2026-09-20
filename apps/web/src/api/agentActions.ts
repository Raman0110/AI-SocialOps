import type { PendingAgentAction } from "../types/agentActions";
import { request } from "./client";

export async function getPendingAgentActions(
  conversationId: string
): Promise<PendingAgentAction[]> {
  return request<PendingAgentAction[]>({
    method: "GET",
    url: "/api/agent-actions",
    params: { conversationId },
  });
}

export async function approveAgentAction(actionId: string): Promise<void> {
  return request<void>({
    method: "POST",
    url: `/api/agent-actions/${actionId}/approve`,
  });
}

export async function rejectAgentAction(actionId: string): Promise<void> {
  return request<void>({
    method: "POST",
    url: `/api/agent-actions/${actionId}/reject`,
  });
}