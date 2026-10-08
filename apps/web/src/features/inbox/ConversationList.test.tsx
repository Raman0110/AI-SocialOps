import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { InboxConversation } from "../../types/conversations";
import { ConversationList } from "./ConversationList";

const conversations: InboxConversation[] = [
  {
    id: "conversation-1",
    customerName: "Maya Sharma",
    platform: "Instagram",
    username: "maya.designs",
    socialAccountName: "Acme Instagram",
    status: "Open",
    lastMessage: "Do you ship to Kathmandu?",
    lastMessageAt: "2026-10-08T09:00:00Z",
  },
  {
    id: "conversation-2",
    customerName: "Ravi Thapa",
    platform: "WhatsApp",
    username: "ravi",
    socialAccountName: "Acme WhatsApp",
    status: "Pending",
    lastMessage: null,
    lastMessageAt: null,
  },
];

describe("ConversationList", () => {
  it("shows an empty state when there are no conversations", () => {
    render(
      <ConversationList
        conversations={[]}
        selectedConversationId={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("No conversations yet.")).toBeInTheDocument();
  });

  it("renders conversation summaries", () => {
    render(
      <ConversationList
        conversations={conversations}
        selectedConversationId="conversation-1"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("Maya Sharma")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("Do you ship to Kathmandu?")).toBeInTheDocument();
    expect(screen.getByText("No messages")).toBeInTheDocument();
  });

  it("calls onSelect with the clicked conversation id", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ConversationList
        conversations={conversations}
        selectedConversationId={null}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole("button", { name: /maya sharma/i }));

    expect(onSelect).toHaveBeenCalledWith("conversation-1");
  });
});
