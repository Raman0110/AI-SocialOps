import { request } from "./client";

export interface AgentToolExecutionResponse {
  id: string;
  toolName: string;
  argumentsJson: string;
  resultJson: string | null;
  success: boolean;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMilliseconds: number | null;
}

export interface AgentRunSummaryResponse {
  id: string;
  organizationId: string;
  conversationId: string;
  inputMessageId: string;
  status: "Running" | "Completed" | "Failed";
  model: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMilliseconds: number | null;
}

export interface AgentRunDetailResponse extends AgentRunSummaryResponse {
  finalReply: string | null;
  error: string | null;
  toolExecutions: AgentToolExecutionResponse[];
}

export async function getAgentRuns(
  conversationId: string,
  organizationId: string,
  limit = 50,
): Promise<AgentRunSummaryResponse[]> {
  return request<AgentRunSummaryResponse[]>({
    method: "GET",
    url: "/api/agent-runs",
    params: { conversationId, organizationId, limit },
  });
}

export async function getAgentRun(
  runId: string,
  organizationId: string,
): Promise<AgentRunDetailResponse> {
  return request<AgentRunDetailResponse>({
    method: "GET",
    url: `/api/agent-runs/${runId}`,
    params: { organizationId },
  });
}
