import type { SocialPlatform } from "../../inbox/types/conversations";

export type AgentRunStatus = "Running" | "Completed" | "Failed";
export type AgentRunTrigger = "Webhook" | "Manual" | "Scheduled";
export type AgentRunStepStatus = "Completed" | "Failed" | "Skipped";

export interface AgentRunStep {
  id: string;
  name: string;
  status: AgentRunStepStatus;
  durationMs: number;
  detail: string;
}

export interface AgentRun {
  id: string;
  agentName: string;
  status: AgentRunStatus;
  trigger: AgentRunTrigger;
  platform: SocialPlatform;
  customerName: string;
  conversationTopic: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  inputSummary: string;
  outputSummary: string | null;
  model: string;
  toolsUsed: string[];
  promptTokens: number;
  completionTokens: number;
  errorMessage: string | null;
  steps: AgentRunStep[];
}
