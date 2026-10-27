import { fireEvent, render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../../test/server";
import { apiInboxReadDataSource } from "../services/inboxReadDataSource";
import { InboxPage } from "./InboxPage";

const apiUrl = "http://localhost:8080";
const organizationId = "00000000-0000-0000-0000-000000000001";
const conversationId = "10000000-0000-0000-0000-000000000001";

describe("InboxPage API integration", () => {
  it("loads the inbox and selected conversation through HTTP", async () => {
    server.use(
      http.get(`${apiUrl}/api/conversations`, ({ request }) => {
        const url = new URL(request.url);

        expect(url.searchParams.get("organizationId")).toBe(organizationId);
        expect(request.headers.get("X-Api-Key")).toBe("dev-api-key");

        return HttpResponse.json([
          {
            id: conversationId,
            customerName: "API Customer",
            platform: "Instagram",
            username: "api.customer",
            socialAccountName: "UrbanThreads Instagram",
            status: "Open",
            lastMessage: "Loaded from the backend contract",
            lastMessageAt: "2026-10-27T08:30:00Z",
          },
        ]);
      }),
      http.get(`${apiUrl}/api/conversations/${conversationId}`, () =>
        HttpResponse.json({
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
              direction: 1,
              senderType: 1,
              content: "API inbound message",
              sentAt: "2026-10-27T08:30:00Z",
            },
          ],
        }),
      ),
    );

    renderInbox();

    expect(await screen.findByText("API Customer")).toBeInTheDocument();
    expect(screen.getByText("Live API reads")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /api customer/i }));

    expect(await screen.findByText("API inbound message")).toBeInTheDocument();
    expect(screen.getByText(/reply and ai actions will be connected next/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("renders the empty state for an empty API inbox", async () => {
    server.use(
      http.get(`${apiUrl}/api/conversations`, () => HttpResponse.json([])),
    );

    renderInbox();

    expect(await screen.findByText("No conversations yet.")).toBeInTheDocument();
    expect(screen.getByText("0 of 0 conversations")).toBeInTheDocument();
  });

  it("shows an authentication error for a 401 response", async () => {
    server.use(
      http.get(`${apiUrl}/api/conversations`, () =>
        HttpResponse.json({ title: "Unauthorized" }, { status: 401 }),
      ),
    );

    renderInbox();

    expect(
      await screen.findByText("Authentication failed. Check the frontend API key."),
    ).toBeInTheDocument();
  });

  it("shows a service error for a server failure", async () => {
    server.use(
      http.get(`${apiUrl}/api/conversations`, () =>
        HttpResponse.json({ title: "Unexpected failure" }, { status: 500 }),
      ),
    );

    renderInbox();

    expect(
      await screen.findByText("The inbox service is temporarily unavailable."),
    ).toBeInTheDocument();
  });
});

function renderInbox() {
  render(
    <InboxPage
      organizationId={organizationId}
      dataSource={apiInboxReadDataSource}
    />,
  );
}
