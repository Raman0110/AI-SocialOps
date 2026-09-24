import type { MessageAnalysis } from "../types/conversations";
import { request } from "./client";

interface AnalyzeMessageRequest {
  message: string;
}

export interface AgentReplyResult {
  reply: string;
  toolsUsed: string[];
  pendingActionIds: string[];
}

export async function analyzeMessage(message: string): Promise<MessageAnalysis> {
  return request<MessageAnalysis>({
    method: "POST",
    url: "/api/ai/analyze-message",
    data: {
      message,
    } satisfies AnalyzeMessageRequest,
  });
}

export async function suggestReply(conversationId: string): Promise<AgentReplyResult> {
  return request<AgentReplyResult>({
    method: "POST",
    url: `/api/conversations/${conversationId}/suggest-reply`,
  });
}

export async function generateAgentReply(conversationId: string): Promise<AgentReplyResult> {
  return request<AgentReplyResult>({
    method: "POST",
    url: `/api/conversations/${conversationId}/agent-reply"`,
  });
}
