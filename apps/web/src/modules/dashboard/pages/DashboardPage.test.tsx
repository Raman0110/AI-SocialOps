import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DashboardPage } from "./DashboardPage";
import { mockDashboardDataSource } from "../services/dashboardDataSource";

describe("DashboardPage", () => {
  it("shows support metrics and opens the inbox", async () => {
    const user = userEvent.setup();
    const onOpenInbox = vi.fn();

    render(
      <DashboardPage
        organizationId="mock-organization"
        onOpenInbox={onOpenInbox}
        onOpenAiActions={vi.fn()}
        dataSource={mockDashboardDataSource}
      />,
    );

    expect(await screen.findByText("Maya Sharma")).toBeInTheDocument();
    expect(screen.getByText("Total conversations")).toBeInTheDocument();
    expect(screen.getByText("Conversation overview")).toBeInTheDocument();
    expect(screen.getByText("Recent conversations")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open inbox/i }));
    expect(onOpenInbox).toHaveBeenCalledOnce();
  });
});
