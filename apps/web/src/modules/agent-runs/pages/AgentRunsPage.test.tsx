import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAgentRun, getAgentRuns } from "../../../api/agentRuns";
import { generateAgentReply } from "../../../api/ai";
import { getInbox } from "../../../api/conversations";
import { AgentRunsPage } from "./AgentRunsPage";

vi.mock("../../../api/agentRuns");
vi.mock("../../../api/ai");
vi.mock("../../../api/conversations");

const conversation = {
  id: "conversation-1",
  customerName: "Maya Sharma",
  platform: "Instagram" as const,
  username: "maya.designs",
  socialAccountName: "UrbanThreads Instagram",
  status: "Open" as const,
  lastMessage: "Is express delivery available?",
  lastMessageAt: "2026-10-08T09:25:00Z",
};

const summary = {
  id: "run-1",
  organizationId: "organization-1",
  conversationId: conversation.id,
  inputMessageId: "message-1",
  status: "Completed" as const,
  model: "test-model",
  startedAt: "2026-10-08T09:25:10Z",
  completedAt: "2026-10-08T09:25:12Z",
  durationMilliseconds: 1840,
};

beforeEach(() => {
  vi.mocked(getInbox).mockResolvedValue([conversation]);
  vi.mocked(getAgentRuns).mockResolvedValue([summary]);
  vi.mocked(getAgentRun).mockResolvedValue({
    ...summary,
    finalReply: "Express delivery is available.",
    error: null,
    toolExecutions: [{
      id: "tool-1",
      toolName: "get_customer_context",
      argumentsJson: "{}",
      resultJson: "{}",
      success: true,
      error: null,
      startedAt: summary.startedAt,
      completedAt: summary.completedAt,
      durationMilliseconds: 340,
    }],
  });
  vi.mocked(generateAgentReply).mockResolvedValue({
    reply: "Express delivery is available.",
    toolsUsed: [],
    pendingActionIds: [],
  });
});

describe("AgentRunsPage", () => {
  it("loads API runs and maps execution details", async () => {
    render(<AgentRunsPage />);

    expect(await screen.findAllByText("Conversation Agent")).toHaveLength(2);
    expect(screen.getByText("Execution timeline")).toBeInTheDocument();
    expect(screen.getAllByText("get_customer_context").length).toBeGreaterThan(0);
  });

  it("retries through the conversation agent endpoint", async () => {
    const user = userEvent.setup();
    render(<AgentRunsPage />);

    await screen.findAllByText("Conversation Agent");
    await user.click(screen.getByRole("button", { name: /retry run/i }));

    await waitFor(() => expect(generateAgentReply).toHaveBeenCalledWith(conversation.id));
  });
});
