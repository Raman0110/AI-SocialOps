import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "../../../test/server";
import { apiDashboardDataSource } from "../services/dashboardDataSource";
import { DashboardPage } from "./DashboardPage";
import { setStoredSession } from "../../auth/services/authStorage";

const apiUrl = "http://localhost:8080";
const organizationId = "00000000-0000-0000-0000-000000000001";

describe("DashboardPage API integration", () => {
  it("loads live metrics, launches a sandbox scenario, and refreshes the dashboard", async () => {
    const user = userEvent.setup();
    const onOpenInbox = vi.fn();
    let inboxRequestCount = 0;
    let webhookPayload: Record<string, unknown> | null = null;
    let webhookMessageId: unknown;

    setStoredSession({
      accessToken: "test-token",
      expiresAtUtc: "2099-01-01T00:00:00Z",
      user: { id: "user-1", name: "Test Owner", email: "owner@example.com" },
      organization: { id: organizationId, name: "UrbanThreads", role: "Owner" },
      memberships: [{ id: organizationId, name: "UrbanThreads", role: "Owner" }],
    });

    server.use(
      http.get(`${apiUrl}/api/conversations`, ({ request }) => {
        inboxRequestCount += 1;
        const url = new URL(request.url);

        expect(url.searchParams.get("organizationId")).toBe(organizationId);
        expect(request.headers.get("Authorization")).toBe("Bearer test-token");
        expect(request.headers.get("X-Api-Key")).toBeNull();

        return HttpResponse.json([
          conversation("conversation-1", "Maya Sharma", "Open", "Instagram"),
          conversation("conversation-2", "Ravi Thapa", "Pending", "WhatsApp"),
          ...(inboxRequestCount > 1
            ? [conversation("conversation-3", "Anisha Rai", "Open", "Instagram")]
            : []),
        ]);
      }),
      http.post(`${apiUrl}/api/webhooks/instagram/sandbox`, async ({ request }) => {
        webhookPayload = await request.json() as Record<string, unknown>;
        webhookMessageId = webhookPayload.messageId;

        return HttpResponse.json({
          accepted: true,
          duplicate: false,
          organizationId,
          conversationId: "conversation-3",
          messageId: "message-3",
        });
      }),
    );

    render(
      <DashboardPage
        organizationId={organizationId}
        onOpenInbox={onOpenInbox}
        onOpenAiActions={vi.fn()}
        dataSource={apiDashboardDataSource}
      />,
    );

    expect(await screen.findByText("Maya Sharma")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();

    const faqCard = screen.getByText("Knowledge-grounded FAQ").closest("article");
    expect(faqCard).not.toBeNull();
    await user.click(within(faqCard!).getByRole("button", { name: /launch scenario/i }));

    expect(await screen.findByText("Knowledge-grounded FAQ is ready")).toBeInTheDocument();
    await waitFor(() => expect(inboxRequestCount).toBe(2));
    expect(await screen.findByText("Anisha Rai")).toBeInTheDocument();
    expect(webhookPayload).toMatchObject({
      businessAccountId: "ig_17841400000000991",
      senderId: "scenario_faq_customer",
      senderUsername: "anisha.rai",
      conversationId: "scenario_faq_conversation",
    });
    expect(String(webhookMessageId)).toMatch(/^scenario_faq_/);

    await user.click(screen.getAllByRole("button", { name: /open inbox/i }).at(-1)!);
    expect(onOpenInbox).toHaveBeenCalled();
  });
});

function conversation(
  id: string,
  customerName: string,
  status: "Open" | "Pending",
  platform: "Instagram" | "WhatsApp",
) {
  return {
    id,
    customerName,
    platform,
    username: customerName.toLowerCase().replace(" ", "."),
    socialAccountName: `UrbanThreads ${platform}`,
    status,
    lastMessage: "Latest customer message",
    lastMessageAt: "2026-11-16T08:00:00Z",
  };
}
