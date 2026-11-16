import type { SandboxScenario } from "../modules/dashboard/types/sandboxScenarios";
import { request } from "./client";

export interface InboundWebhookResult {
  accepted: boolean;
  duplicate: boolean;
  organizationId: string | null;
  conversationId: string | null;
  messageId: string | null;
}

const SANDBOX_INSTAGRAM_ACCOUNT_ID = "ig_17841400000000991";

export async function launchSandboxScenario(
  scenario: SandboxScenario,
): Promise<InboundWebhookResult> {
  const uniqueMessageId = `scenario_${scenario.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return request<InboundWebhookResult>({
    method: "POST",
    url: "/api/webhooks/instagram/sandbox",
    data: {
      businessAccountId: SANDBOX_INSTAGRAM_ACCOUNT_ID,
      senderId: scenario.senderId,
      senderUsername: scenario.senderUsername,
      conversationId: scenario.externalConversationId,
      messageId: uniqueMessageId,
      text: scenario.message,
    },
  });
}
