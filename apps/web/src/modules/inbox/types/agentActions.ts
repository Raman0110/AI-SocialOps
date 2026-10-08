export interface PendingAgentAction {
  id: string;
  type: string;
  payloadJson: string;
  createdAt: string;
}

export interface CreateSupportTicketPayload {
  title: string;
  description: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
}