import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AgentRunsPage } from "./AgentRunsPage";

describe("AgentRunsPage", () => {
  it("loads runs and shows execution details", async () => {
    render(<AgentRunsPage />);

    expect(await screen.findAllByText("Reply Assistant")).toHaveLength(2);
    expect(screen.getByText("Execution summary")).toBeInTheDocument();
    expect(screen.getByText("Execution timeline")).toBeInTheDocument();
    expect(screen.getByText("Tools used")).toBeInTheDocument();
  });

  it("filters runs by search term", async () => {
    const user = userEvent.setup();
    render(<AgentRunsPage />);

    await screen.findAllByText("Reply Assistant");
    await user.type(screen.getByPlaceholderText(/search run/i), "facebook sync");

    await waitFor(() => {
      expect(screen.getAllByText("Conversation Sync Agent")).toHaveLength(2);
      expect(screen.queryByText("Maya Sharma")).not.toBeInTheDocument();
    });
    expect(screen.getByText(/access token expired/i)).toBeInTheDocument();
  });

  it("starts a mock retry for a completed run", async () => {
    const user = userEvent.setup();
    render(<AgentRunsPage />);

    await screen.findAllByText("Reply Assistant");
    await user.click(screen.getByRole("button", { name: /retry run/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Running").length).toBeGreaterThan(0);
      expect(screen.getByText("run-maya-reply-retry")).toBeInTheDocument();
    });
  });
});
