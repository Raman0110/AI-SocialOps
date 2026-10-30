import type {
  CreateKnowledgeEntryInput,
  KnowledgeEntry,
} from "../modules/knowledge/types/knowledge";
import { request } from "./client";

export function getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  return request<KnowledgeEntry[]>({
    method: "GET",
    url: "/api/knowledge",
  });
}

export function createKnowledgeEntry(
  input: CreateKnowledgeEntryInput,
): Promise<KnowledgeEntry> {
  return request<KnowledgeEntry>({
    method: "POST",
    url: "/api/knowledge",
    data: input,
  });
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  await request<void>({
    method: "DELETE",
    url: `/api/knowledge/${id}`,
  });
}
