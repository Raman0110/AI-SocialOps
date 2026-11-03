import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../../test/server";
import { apiInboxReadDataSource } from "../services/inboxReadDataSource";
import { InboxPage } from "./InboxPage";

const apiUrl = "http://localhost:8080";
const organizationId = "00000000-0000-0000-0000-000000000001";
const conversationId = "10000000-0000-0000-0000-000000000001";
const outboundMessageId = "20000000-0000-0000-0000-000000000002";

type Delivery = { deliveryStatus: string; deliveryError: string | null };

function useConversation(getDelivery: () => Delivery | undefined) {
  server.use(
    http.get(`${apiUrl}/api/conversations`, () =>
      HttpResponse.json([
        {
          id: conversationId,
          customerName: "API Customer",
          platform: "Instagram",
          username: "api.customer",
          socialAccountName: "UrbanThreads Instagram",
          status: "Open",
          lastMessage: "We are on it",
          lastMessageAt: "2026-10-27T08:35:00Z",
        },
      ]),
    ),
    http.get(`${apiUrl}/api/conversations/${conversationId}`, () => {
      const delivery = getDelivery();

      return HttpResponse.json({
        id: conversationId,
        organizationId,
        customerName: "API Customer",
        platform: "Instagram",
        username: "api.customer",
        socialAccountName: "UrbanThreads Instagram",
        status: "Open",
        messages: [
          {
            id: "20000000-0000-0000-0000-000000000001",
            direction: "Inbound",
            senderType: "Customer",
            content: "Where is my order?",
            sentAt: "2026-10-27T08:30:00Z",
            deliveryStatus: "None",
            deliveryError: null,
          },
          {
            id: outboundMessageId,
            direction: "Outbound",
            senderType: "HumanAgent",
            content: "We are on it",
            sentAt: "2026-10-27T08:35:00Z",
            ...(delivery ?? { deliveryStatus: "None", deliveryError: null }),
          },
        ],
      });
    }),
    http.get(`${apiUrl}/api/agent-actions`, () => HttpResponse.json([])),
  );
}

async function openConversation() {
  render(<InboxPage organizationId={organizationId} dataSource={apiInboxReadDataSource} />);

  fireEvent.click(await screen.findByRole("button", { name: /api customer/i }));

  expect(await screen.findByText("We are on it", { selector: "div" })).toBeInTheDocument();
}

describe("InboxPage delivery status", () => {
  it("shows a failed message with its reason and a retry button", async () => {
    useConversation(() => ({
      deliveryStatus: "Failed",
      deliveryError: "Recipient is outside the messaging window.",
    }));

    await openConversation();

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to send");
    expect(screen.getByRole("alert")).toHaveTextContent("Recipient is outside the messaging window.");
    expect(screen.getByRole("button", { name: /retry sending/i })).toBeEnabled();
  });

  it("retries a failed message and shows it as sent", async () => {
    let delivery: Delivery = { deliveryStatus: "Failed", deliveryError: "Temporary error" };
    let retried = 0;

    useConversation(() => delivery);
    server.use(
      http.post(
        `${apiUrl}/api/conversations/${conversationId}/messages/${outboundMessageId}/retry`,
        () => {
          retried += 1;
          delivery = { deliveryStatus: "Sent", deliveryError: null };

          return HttpResponse.json({ id: outboundMessageId, ...delivery });
        },
      ),
    );

    await openConversation();
    fireEvent.click(screen.getByRole("button", { name: /retry sending/i }));

    expect(await screen.findByText("Sent")).toBeInTheDocument();
    expect(retried).toBe(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps the failure visible and explains when the retry request fails", async () => {
    useConversation(() => ({ deliveryStatus: "Failed", deliveryError: "Temporary error" }));
    server.use(
      http.post(
        `${apiUrl}/api/conversations/${conversationId}/messages/${outboundMessageId}/retry`,
        () => HttpResponse.json({ title: "Unexpected failure" }, { status: 500 }),
      ),
    );

    await openConversation();
    fireEvent.click(screen.getByRole("button", { name: /retry sending/i }));

    expect(await screen.findByText("Unable to retry sending. Try again.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: /retry sending/i })).toBeEnabled());
  });

  it("shows sent and sending states without a retry button", async () => {
    useConversation(() => ({ deliveryStatus: "Pending", deliveryError: null }));

    await openConversation();

    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry sending/i })).not.toBeInTheDocument();
  });

  it("shows nothing extra for messages without delivery tracking", async () => {
    useConversation(() => undefined);

    await openConversation();

    expect(screen.queryByText("Sent")).not.toBeInTheDocument();
    expect(screen.queryByText("Sending...")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
