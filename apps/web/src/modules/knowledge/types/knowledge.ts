export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface CreateKnowledgeEntryInput {
  title: string;
  content: string;
}

export const KNOWLEDGE_TITLE_MAX_LENGTH = 200;
export const KNOWLEDGE_CONTENT_MAX_LENGTH = 4000;
