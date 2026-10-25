import type { AgentRun } from "../types/agentRuns";

const delay = (duration = 180) =>
  import.meta.env.MODE === "test"
    ? Promise.resolve()
    : new Promise((resolve) => window.setTimeout(resolve, duration));

const runs: AgentRun[] = [
  {
    id: "run-maya-reply",
    agentName: "Reply Assistant",
    status: "Completed",
    trigger: "Webhook",
    platform: "Instagram",
    customerName: "Maya Sharma",
    conversationTopic: "Express delivery before Friday",
    startedAt: "2026-10-08T09:25:10Z",
    completedAt: "2026-10-08T09:25:12Z",
    durationMs: 1840,
    inputSummary: "New inbound message asking whether express delivery is available.",
    outputSummary: "Generated a delivery reply with 91% confidence and low risk.",
    model: "gpt-5-mini",
    toolsUsed: ["get_customer_context", "get_shipping_options", "get_conversation_history"],
    promptTokens: 1138,
    completionTokens: 142,
    errorMessage: null,
    steps: [
      { id: "maya-step-1", name: "Load context", status: "Completed", durationMs: 340, detail: "Loaded customer and conversation history." },
      { id: "maya-step-2", name: "Classify message", status: "Completed", durationMs: 410, detail: "Detected delivery question with medium priority." },
      { id: "maya-step-3", name: "Generate reply", status: "Completed", durationMs: 1090, detail: "Created a reply for human approval." },
    ],
  },
  {
    id: "run-sophia-escalation",
    agentName: "Risk & Escalation Agent",
    status: "Completed",
    trigger: "Webhook",
    platform: "Facebook",
    customerName: "Sophia Lee",
    conversationTopic: "Delayed response complaint",
    startedAt: "2026-10-07T16:10:20Z",
    completedAt: "2026-10-07T16:10:23Z",
    durationMs: 2680,
    inputSummary: "Customer reported multiple unanswered messages and expressed frustration.",
    outputSummary: "Created a high-risk escalation action for support lead review.",
    model: "gpt-5-mini",
    toolsUsed: ["detect_sentiment", "score_risk", "create_escalation_plan"],
    promptTokens: 1482,
    completionTokens: 196,
    errorMessage: null,
    steps: [
      { id: "sophia-step-1", name: "Analyze sentiment", status: "Completed", durationMs: 620, detail: "Detected angry sentiment." },
      { id: "sophia-step-2", name: "Score risk", status: "Completed", durationMs: 710, detail: "Assigned high churn risk." },
      { id: "sophia-step-3", name: "Prepare escalation", status: "Completed", durationMs: 1350, detail: "Created a pending escalation action." },
    ],
  },
  {
    id: "run-facebook-sync-failed",
    agentName: "Conversation Sync Agent",
    status: "Failed",
    trigger: "Scheduled",
    platform: "Facebook",
    customerName: "System batch",
    conversationTopic: "Facebook account synchronization",
    startedAt: "2026-10-08T06:00:00Z",
    completedAt: "2026-10-08T06:00:04Z",
    durationMs: 4210,
    inputSummary: "Scheduled sync for the UrbanThreads Facebook account.",
    outputSummary: null,
    model: "gpt-5-mini",
    toolsUsed: ["fetch_social_account", "sync_recent_messages"],
    promptTokens: 220,
    completionTokens: 0,
    errorMessage: "Facebook access token expired. Reauthorization is required.",
    steps: [
      { id: "facebook-step-1", name: "Load account", status: "Completed", durationMs: 190, detail: "Resolved the organization social account." },
      { id: "facebook-step-2", name: "Fetch messages", status: "Failed", durationMs: 4020, detail: "Platform returned an expired-token error." },
      { id: "facebook-step-3", name: "Persist messages", status: "Skipped", durationMs: 0, detail: "Skipped because message retrieval failed." },
    ],
  },
  {
    id: "run-ravi-ticket",
    agentName: "Support Workflow Agent",
    status: "Running",
    trigger: "Manual",
    platform: "WhatsApp",
    customerName: "Ravi Thapa",
    conversationTopic: "Wrong jacket size exchange",
    startedAt: "2026-10-08T09:30:00Z",
    completedAt: null,
    durationMs: null,
    inputSummary: "Operator requested a support workflow for an exchange request.",
    outputSummary: null,
    model: "gpt-5-mini",
    toolsUsed: ["get_customer_context", "lookup_exchange_policy"],
    promptTokens: 760,
    completionTokens: 0,
    errorMessage: null,
    steps: [
      { id: "ravi-step-1", name: "Load context", status: "Completed", durationMs: 310, detail: "Loaded order and customer details." },
      { id: "ravi-step-2", name: "Check policy", status: "Completed", durationMs: 450, detail: "Exchange policy permits the request." },
    ],
  },
  {
    id: "run-nima-summary",
    agentName: "Customer Summary Agent",
    status: "Completed",
    trigger: "Manual",
    platform: "TikTok",
    customerName: "Nima Gurung",
    conversationTopic: "Product availability",
    startedAt: "2026-10-07T11:16:00Z",
    completedAt: "2026-10-07T11:16:01Z",
    durationMs: 970,
    inputSummary: "Operator requested a customer activity summary.",
    outputSummary: "Positive first interaction from a TikTok campaign lead.",
    model: "gpt-5-mini",
    toolsUsed: ["summarize_customer_context"],
    promptTokens: 610,
    completionTokens: 88,
    errorMessage: null,
    steps: [
      { id: "nima-step-1", name: "Summarize context", status: "Completed", durationMs: 970, detail: "Generated customer summary and suggested tags." },
    ],
  },
];

export async function getMockAgentRuns(): Promise<AgentRun[]> {
  await delay();
  return runs.map(cloneRun);
}

export async function retryMockAgentRun(runId: string): Promise<AgentRun> {
  await delay(300);
  const run = runs.find((item) => item.id === runId);

  if (!run) {
    throw new Error("Agent run not found.");
  }

  return {
    ...cloneRun(run),
    id: `${run.id}-retry`,
    status: "Running",
    trigger: "Manual",
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationMs: null,
    outputSummary: null,
    errorMessage: null,
    steps: [],
  };
}

function cloneRun(run: AgentRun): AgentRun {
  return {
    ...run,
    toolsUsed: [...run.toolsUsed],
    steps: run.steps.map((step) => ({ ...step })),
  };
}
