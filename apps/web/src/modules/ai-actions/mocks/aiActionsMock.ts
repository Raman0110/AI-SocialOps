import type { AiAction, AiActionStatus } from "../types/aiActions";

const delay = (duration = 180) =>
  import.meta.env.MODE === "test"
    ? Promise.resolve()
    : new Promise((resolve) => window.setTimeout(resolve, duration));

const actions: AiAction[] = [
  {
    id: "action-ravi-ticket",
    type: "Create support ticket",
    status: "Pending",
    risk: "Medium",
    confidence: 0.88,
    customerName: "Ravi Thapa",
    conversationTopic: "Wrong jacket size exchange",
    platform: "WhatsApp",
    createdAt: "2026-10-08T08:43:00Z",
    reasoning:
      "The customer received the wrong item size and is asking for an exchange. A support ticket gives the operations team a trackable workflow.",
    payload: {
      title: "Exchange request for wrong jacket size",
      priority: "High",
      description: "Customer received the wrong jacket size and wants an exchange.",
    },
    toolsUsed: ["get_customer_context", "classify_intent", "draft_ticket_payload"],
  },
  {
    id: "action-sophia-escalation",
    type: "Escalate conversation",
    status: "Pending",
    risk: "High",
    confidence: 0.94,
    customerName: "Sophia Lee",
    conversationTopic: "Delayed response complaint",
    platform: "Facebook",
    createdAt: "2026-10-07T16:13:00Z",
    reasoning:
      "Customer expressed frustration after multiple unanswered messages. The sentiment and complaint history indicate churn risk.",
    payload: {
      owner: "Support lead",
      priority: "Urgent",
      summary: "Customer reported multiple ignored messages and needs human follow-up.",
    },
    toolsUsed: ["detect_sentiment", "score_risk", "create_escalation_plan"],
  },
  {
    id: "action-maya-reply",
    type: "Suggested reply",
    status: "Pending",
    risk: "Low",
    confidence: 0.91,
    customerName: "Maya Sharma",
    conversationTopic: "Express delivery before Friday",
    platform: "Instagram",
    createdAt: "2026-10-08T09:26:00Z",
    reasoning:
      "The customer has a delivery question with high purchase intent. A quick answer can help them complete the order.",
    payload: {
      reply:
        "Yes, express delivery is available for Kathmandu. If you place the order today, we can prioritize dispatch and share tracking right away.",
    },
    toolsUsed: ["get_shipping_options", "get_conversation_history"],
  },
  {
    id: "action-nima-tag",
    type: "Add customer tag",
    status: "Approved",
    risk: "Low",
    confidence: 0.82,
    customerName: "Nima Gurung",
    conversationTopic: "Product availability",
    platform: "TikTok",
    createdAt: "2026-10-07T11:17:00Z",
    reasoning:
      "The customer came from a TikTok campaign and completed a positive first interaction.",
    payload: {
      tags: ["TikTok lead", "Positive interaction"],
    },
    toolsUsed: ["campaign_source_lookup", "summarize_customer_context"],
  },
  {
    id: "action-sophia-ticket",
    type: "Create support ticket",
    status: "Rejected",
    risk: "High",
    confidence: 0.79,
    customerName: "Sophia Lee",
    conversationTopic: "Delayed response complaint",
    platform: "Facebook",
    createdAt: "2026-10-07T16:16:00Z",
    reasoning:
      "A duplicate support ticket was detected for the same complaint thread.",
    payload: {
      title: "Duplicate delayed response complaint",
      priority: "Urgent",
      description: "Possible duplicate of the escalated complaint ticket.",
    },
    toolsUsed: ["duplicate_ticket_check", "draft_ticket_payload"],
  },
];

export async function getMockAiActions(): Promise<AiAction[]> {
  await delay();
  return actions.map(cloneAction);
}

export async function resolveMockAiAction(
  actionId: string,
  status: Extract<AiActionStatus, "Approved" | "Rejected">,
): Promise<AiAction> {
  await delay();

  const action = actions.find((item) => item.id === actionId);

  if (!action) {
    throw new Error("AI action not found.");
  }

  action.status = status;
  return cloneAction(action);
}

function cloneAction(action: AiAction): AiAction {
  return {
    ...action,
    payload: { ...action.payload },
    toolsUsed: [...action.toolsUsed],
  };
}
