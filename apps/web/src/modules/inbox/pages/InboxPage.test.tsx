import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InboxPage } from "./InboxPage";

describe("InboxPage", () => {
  it("loads mock conversations and filters them by search", async () => {
    render(
      <InboxPage organizationId="00000000-0000-0000-0000-000000000001" />
    );

    expect(screen.getByText("Loading inbox...")).toBeInTheDocument();

    expect(await screen.findAllByText("Maya Sharma")).not.toHaveLength(0);

    expect(screen.getByText("Ravi Thapa")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search conversations"), {
      target: { value: "sophia" },
    });

    expect(screen.getByText("Sophia Lee")).toBeInTheDocument();
    expect(screen.queryByText("Ravi Thapa")).not.toBeInTheDocument();
  });

  it("opens a conversation in a full-page view and returns to the inbox", async () => {
    render(
      <InboxPage organizationId="00000000-0000-0000-0000-000000000001" />
    );

    const conversationRow = await screen.findByRole("button", { name: /maya sharma/i });
    expect(screen.queryByText(/express delivery available/i)).not.toBeInTheDocument();

    fireEvent.click(conversationRow);

    expect(await screen.findByText(/express delivery available/i)).toBeInTheDocument();
    expect(screen.queryByText("Ravi Thapa")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "AI Analysis" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open ai analysis/i }));
    expect(screen.getByRole("heading", { name: "AI Analysis" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /analyze conversation/i }));
    expect(await screen.findByText("91%")).toBeInTheDocument();
    expect(screen.getByText("High confidence")).toBeInTheDocument();
    expect(screen.getByText("Delivery Question")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close ai panel/i }));
    expect(screen.queryByRole("heading", { name: "AI Analysis" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back to inbox/i }));
    expect(screen.getByText("Ravi Thapa")).toBeInTheDocument();
  }, 30_000);
});
