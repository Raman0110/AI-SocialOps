export type SandboxScenarioId = "faq" | "complaint" | "escalation";

export interface SandboxScenario {
  id: SandboxScenarioId;
  title: string;
  label: string;
  description: string;
  expectedOutcome: string;
  senderId: string;
  senderUsername: string;
  externalConversationId: string;
  message: string;
}

export const sandboxScenarios: SandboxScenario[] = [
  {
    id: "faq",
    title: "Knowledge-grounded FAQ",
    label: "Low risk",
    description: "A shopper asks about express delivery inside Kathmandu.",
    expectedOutcome: "The agent should search company knowledge and draft a grounded answer.",
    senderId: "scenario_faq_customer",
    senderUsername: "anisha.rai",
    externalConversationId: "scenario_faq_conversation",
    message: "Hi! Do you offer express delivery inside Kathmandu? I need the order tomorrow.",
  },
  {
    id: "complaint",
    title: "Damaged order complaint",
    label: "High priority",
    description: "A customer reports that an item arrived damaged.",
    expectedOutcome: "The agent should ask for evidence and avoid promising an automatic refund.",
    senderId: "scenario_complaint_customer",
    senderUsername: "kabir.shrestha",
    externalConversationId: "scenario_complaint_conversation",
    message: "My order arrived today, but the jacket is damaged. I want this fixed as soon as possible.",
  },
  {
    id: "escalation",
    title: "Human escalation",
    label: "Approval required",
    description: "A frustrated customer reports repeated unanswered messages.",
    expectedOutcome: "The agent should propose a support ticket for human approval.",
    senderId: "scenario_escalation_customer",
    senderUsername: "sara.khadka",
    externalConversationId: "scenario_escalation_conversation",
    message: "This is my third message and nobody has helped me. Please escalate this to a manager now.",
  },
];
