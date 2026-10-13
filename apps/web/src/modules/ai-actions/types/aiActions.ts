import type { SocialPlatform } from "../../inbox/types/conversations";

export type AiActionType =
  | "Suggested reply"
  | "Create support ticket"
  | "Escalate conversation"
  | "Add customer tag";

export type AiActionRisk = "Low" | "Medium" | "High";
export type AiActionStatus = "Pending" | "Approved" | "Rejected";

export interface AiAction {
  id: string;
  type: AiActionType;
  status: AiActionStatus;
  risk: AiActionRisk;
  confidence: number;
  customerName: string;
  conversationTopic: string;
  platform: SocialPlatform;
  createdAt: string;
  reasoning: string;
  payload: Record<string, string | string[]>;
  toolsUsed: string[];
}
