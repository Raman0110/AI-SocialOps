import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { approveAgentAction, getPendingAgentActions } from "../../../api/agentActions";
import { getInbox } from "../../../api/conversations";
import { AiActionsPage } from "./AiActionsPage";

vi.mock("../../../api/agentActions");
vi.mock("../../../api/conversations");

beforeEach(() => {
  vi.mocked(getInbox).mockResolvedValue([{
    id: "conversation-1",
    customerName: "Ravi Thapa",
    platform: "WhatsApp",
    username: "+9779800000000",
    socialAccountName: "UrbanThreads WhatsApp",
    status: "Pending",
    lastMessage: "Can I exchange the jacket?",
    lastMessageAt: "2026-10-08T08:40:00Z",
  }]);
  vi.mocked(getPendingAgentActions).mockResolvedValue([{
    id: "action-1",
    type: "CreateSupportTicket",
    payloadJson: JSON.stringify({ title: "Exchange request", priority: "High" }),
    createdAt: "2026-10-08T08:43:00Z",
  }]);
  vi.mocked(approveAgentAction).mockResolvedValue(undefined);
});

describe("AiActionsPage", () => {
  it("loads and maps pending API actions", async () => {
    render(<AiActionsPage organizationId="organization-1" />);

    expect(await screen.findAllByText("Create support ticket")).toHaveLength(2);
    expect(screen.getAllByText("Ravi Thapa · Can I exchange the jacket?").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not provided").length).toBeGreaterThan(0);
  });

  it("approves a pending action through the API", async () => {
    const user = userEvent.setup();
    render(<AiActionsPage organizationId="organization-1" />);

    await screen.findAllByText("Create support ticket");
    await user.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => expect(approveAgentAction).toHaveBeenCalledWith("action-1"));
    expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
  });
});
