import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceModal } from "./WorkspaceModal";

describe("WorkspaceModal", () => {
  it("creates a workspace from the switcher", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(undefined);

    render(
      <WorkspaceModal
        open
        currentOrganizationId="organization-a"
        memberships={[{ id: "organization-a", name: "Workspace A", role: "Owner" }]}
        onClose={vi.fn()}
        onSwitch={vi.fn()}
        onCreate={onCreate}
      />,
    );

    await user.type(screen.getByLabelText("Workspace name"), "Workspace B");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onCreate).toHaveBeenCalledWith("Workspace B");
  });
});
