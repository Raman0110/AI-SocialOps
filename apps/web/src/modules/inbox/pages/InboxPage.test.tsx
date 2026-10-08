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

  it("shows the selected conversation detail on first load", async () => {
    render(
      <InboxPage organizationId="00000000-0000-0000-0000-000000000001" />
    );

    expect(await screen.findByText(/UrbanThreads Instagram/)).toBeInTheDocument();

    expect(screen.getByText(/express delivery available/i)).toBeInTheDocument();
  });
});
