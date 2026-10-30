import {
  createKnowledgeEntry,
  deleteKnowledgeEntry,
  getKnowledgeEntries,
} from "../../../api/knowledge";
import { runtimeConfig } from "../../../shared/config/runtime";
import {
  createMockKnowledgeEntry,
  deleteMockKnowledgeEntry,
  getMockKnowledgeEntries,
} from "../mocks/knowledgeMock";
import type { CreateKnowledgeEntryInput, KnowledgeEntry } from "../types/knowledge";

export interface KnowledgeDataSource {
  mode: "api" | "mock";
  getKnowledgeEntries: () => Promise<KnowledgeEntry[]>;
  createKnowledgeEntry: (input: CreateKnowledgeEntryInput) => Promise<KnowledgeEntry>;
  deleteKnowledgeEntry: (id: string) => Promise<void>;
}

export const apiKnowledgeDataSource: KnowledgeDataSource = {
  mode: "api",
  getKnowledgeEntries,
  createKnowledgeEntry,
  deleteKnowledgeEntry,
};

export const mockKnowledgeDataSource: KnowledgeDataSource = {
  mode: "mock",
  getKnowledgeEntries: getMockKnowledgeEntries,
  createKnowledgeEntry: createMockKnowledgeEntry,
  deleteKnowledgeEntry: deleteMockKnowledgeEntry,
};

export const defaultKnowledgeDataSource = runtimeConfig.useMocks
  ? mockKnowledgeDataSource
  : apiKnowledgeDataSource;
