import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMemberships } from "../../../api/memberships";
import { OrganizationSettingsPage } from "./OrganizationSettingsPage";

vi.mock("../../../api/memberships", () => ({
  getMemberships: vi.fn(),
  createMembership: vi.fn(),
  updateMembershipRole: vi.fn(),
  deleteMembership: vi.fn(),
}));

describe("OrganizationSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMemberships).mockResolvedValue([
      {
        id: "membership-1",
        userId: "user-1",
        name: "Workspace Owner",
        email: "owner@example.com",
        role: "Owner",
        createdAt: "2026-11-17T00:00:00Z",
      },
    ]);
  });

  it("loads organization members for an owner", async () => {
    render(
      <OrganizationSettingsPage
        currentUserId="user-1"
        currentRole="Owner"
        organizationName="UrbanThreads"
      />,
    );

    expect(await screen.findByText("Workspace Owner")).toBeInTheDocument();
    expect(screen.getByText("Owner · You")).toBeInTheDocument();
  });

  it("does not request members for a viewer", () => {
    render(
      <OrganizationSettingsPage
        currentUserId="user-2"
        currentRole="Viewer"
        organizationName="UrbanThreads"
      />,
    );

    expect(screen.getByText("Administrator access required")).toBeInTheDocument();
    expect(getMemberships).not.toHaveBeenCalled();
  });
});
