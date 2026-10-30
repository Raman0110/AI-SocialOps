import type { CreateKnowledgeEntryInput, KnowledgeEntry } from "../types/knowledge";

let entries: KnowledgeEntry[] = [
  {
    id: "knowledge-1",
    title: "Refund policy",
    content: "Refunds are issued to the original payment method within 7 days of the returned item arriving.",
    createdAt: "2026-10-01T09:00:00Z",
  },
  {
    id: "knowledge-2",
    title: "Shipping times",
    content: "Orders ship within 2 business days. Delivery inside Kathmandu takes 1-2 days, elsewhere 3-5 days.",
    createdAt: "2026-10-02T09:00:00Z",
  },
];

export async function getMockKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  return [...entries];
}

export async function createMockKnowledgeEntry(
  input: CreateKnowledgeEntryInput,
): Promise<KnowledgeEntry> {
  const entry: KnowledgeEntry = {
    id: `knowledge-${Date.now()}`,
    title: input.title.trim(),
    content: input.content.trim(),
    createdAt: new Date().toISOString(),
  };
  entries = [...entries, entry];
  return entry;
}

export async function deleteMockKnowledgeEntry(id: string): Promise<void> {
  entries = entries.filter((entry) => entry.id !== id);
}
