import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { InboxPage } from "./InboxPage";

describe("InboxPage", () => {
  it("loads mock conversations and filters them by search", async () => {
    const user = userEvent.setup();

    render(
      <InboxPage organizationId="00000000-0000-0000-0000-000000000001" />
    );

    expect(screen.getByText("Loading inbox...")).toBeInTheDocument();

    await screen.findByRole("button", { name: /maya sharma/i });

    expect(screen.getByRole("button", { name: /ravi thapa/i })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Search conversations"), "sophia");

    expect(screen.getByRole("button", { name: /sophia lee/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /maya sharma/i })).not.toBeInTheDocument();
  });

  it("shows the selected conversation detail on first load", async () => {
    render(
      <InboxPage organizationId="00000000-0000-0000-0000-000000000001" />
    );

    await waitFor(() => {
      expect(screen.getByText("Company account: UrbanThreads Instagram")).toBeInTheDocument();
    });

    expect(screen.getByText(/express delivery available/i)).toBeInTheDocument();
  });
});
