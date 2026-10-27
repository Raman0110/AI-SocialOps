import { getConversation, getInbox } from "../../../api/conversations";
import { runtimeConfig } from "../../../shared/config/runtime";
import { getMockConversation, getMockInbox } from "../mocks/socialopsMock";
import type { ConversationDetails, InboxConversation } from "../types/conversations";

export interface InboxReadDataSource {
  mode: "api" | "mock";
  getInbox: (organizationId: string) => Promise<InboxConversation[]>;
  getConversation: (conversationId: string) => Promise<ConversationDetails>;
}

export const apiInboxReadDataSource: InboxReadDataSource = {
  mode: "api",
  getInbox,
  getConversation,
};

export const mockInboxReadDataSource: InboxReadDataSource = {
  mode: "mock",
  getInbox: () => getMockInbox(),
  getConversation: getMockConversation,
};

export const defaultInboxReadDataSource = runtimeConfig.useMocks
  ? mockInboxReadDataSource
  : apiInboxReadDataSource;
