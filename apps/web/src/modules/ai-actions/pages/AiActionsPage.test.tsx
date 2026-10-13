import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AiActionsPage } from "./AiActionsPage";

describe("AiActionsPage", () => {
  it("loads pending AI actions and shows the selected action preview", async () => {
    render(<AiActionsPage />);

    expect(await screen.findAllByText("Create support ticket")).toHaveLength(2);
    expect(screen.getByText("AI reasoning")).toBeInTheDocument();
    expect(screen.getByText("Proposed payload")).toBeInTheDocument();
  });

  it("filters actions by search term", async () => {
    const user = userEvent.setup();

    render(<AiActionsPage />);

    await screen.findAllByText("Create support ticket");
    await user.type(screen.getByPlaceholderText(/search customer/i), "Maya");

    await waitFor(() => {
      expect(screen.getAllByText("Suggested reply")).toHaveLength(2);
      expect(screen.queryByText("Ravi Thapa")).not.toBeInTheDocument();
    });
  });

  it("approves a pending action", async () => {
    const user = userEvent.setup();

    render(<AiActionsPage />);

    await screen.findAllByText("Create support ticket");
    await user.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
    });
  });
});
