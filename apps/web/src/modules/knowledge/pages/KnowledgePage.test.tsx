import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { KnowledgePage } from "./KnowledgePage";
import type { KnowledgeDataSource } from "../services/knowledgeDataSource";
import type { KnowledgeEntry } from "../types/knowledge";

function createDataSource(initial: KnowledgeEntry[]): KnowledgeDataSource {
  let entries = [...initial];

  return {
    mode: "mock",
    getKnowledgeEntries: async () => entries,
    createKnowledgeEntry: async (input) => {
      const entry = { id: "new", ...input, createdAt: "2026-10-30T00:00:00Z" };
      entries = [...entries, entry];
      return entry;
    },
    deleteKnowledgeEntry: async (id) => {
      entries = entries.filter((entry) => entry.id !== id);
    },
  };
}

const refund: KnowledgeEntry = {
  id: "1",
  title: "Refund policy",
  content: "Refunds within 7 days.",
  createdAt: "2026-10-01T00:00:00Z",
};

describe("KnowledgePage", () => {
  it("lists existing entries", async () => {
    render(<KnowledgePage dataSource={createDataSource([refund])} />);

    expect(await screen.findByText("Refund policy")).toBeInTheDocument();
    expect(screen.getByText("Refunds within 7 days.")).toBeInTheDocument();
  });

  it("adds a new entry", async () => {
    const user = userEvent.setup();

    render(<KnowledgePage dataSource={createDataSource([])} />);

    await screen.findByText("No knowledge entries yet");
    await user.type(screen.getByLabelText("Title"), "Opening hours");
    await user.type(screen.getByLabelText("Content"), "Open 10am to 6pm.");
    await user.click(screen.getByRole("button", { name: /add entry/i }));

    expect(await screen.findByText("Open 10am to 6pm.")).toBeInTheDocument();
  });

  it("filters entries by search term", async () => {
    const user = userEvent.setup();
    const shipping = { ...refund, id: "2", title: "Shipping times", content: "2 days." };

    render(<KnowledgePage dataSource={createDataSource([refund, shipping])} />);

    await screen.findByText("Refund policy");
    await user.type(screen.getByPlaceholderText("Search entries"), "shipping");

    await waitFor(() => {
      expect(screen.queryByText("Refund policy")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Shipping times")).toBeInTheDocument();
  });
});
