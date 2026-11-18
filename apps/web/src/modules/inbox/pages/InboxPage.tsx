import { useEffect, useState } from "react";
import { Alert, Input, Select } from "antd";
import { Badge, SkeletonRows } from "../../../shared/ui";

import {
  addMockMessage,
  analyzeMockConversation,
  generateMockAgentReply,
  getMockInbox,
  getMockPendingActions,
  resolveMockPendingAction,
} from "../mocks/socialopsMock";

import type {
  ConversationStatus,
  ConversationDetails,
  InboxConversation,
  MessageAnalysis,
  SocialPlatform,
} from "../types/conversations";

import { ConversationList } from "../components/ConversationList";
import { ConversationDetails as ConversationDetailsView } from "../components/ConversationDetails";
import { generateAgentReply, type AgentReplyResult } from "../../../api/ai";
import {
  addMessage,
  analyzeConversation,
  retryMessage,
} from "../../../api/conversations";
import {
  approveAgentAction,
  getPendingAgentActions,
  rejectAgentAction,
} from "../../../api/agentActions";
import { ApiError } from "../../../api/client/utils/api-client.utils";
import type { PendingAgentAction } from "../types/agentActions";
import {
  defaultInboxReadDataSource,
  type InboxReadDataSource,
} from "../services/inboxReadDataSource";


interface InboxPageProps {
  organizationId: string;
  dataSource?: InboxReadDataSource;
}

export type AnalysisState = {
  data: MessageAnalysis | null;
  isLoading: boolean;
  error: string | null;
};

export type SuggestedReplyState = {
  data: string | null;
  isLoading: boolean;
  error: string | null;
};

export type AgentActionsState = {
  data: PendingAgentAction[];
  isLoading: boolean;
  error: string | null;
};

export type AgentReplyState = {
  data: AgentReplyResult | null;
  isLoading: boolean;
  error: string | null;
};

export function InboxPage({
  organizationId,
  dataSource = defaultInboxReadDataSource,
}: InboxPageProps) {
  const [conversations, setConversations] = useState<InboxConversation[]>([]);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const [selectedConversation, setSelectedConversation] = useState<ConversationDetails | null>(null);

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const [agentActionsState, setAgentActionsState] = useState<AgentActionsState>({
    data: [],
    isLoading: false,
    error: null,
  });

  const [agentReplyState, setAgentReplyState] = useState<AgentReplyState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "All">("All");
  const isMockMode = dataSource.mode === "mock";

  const filteredConversations = conversations.filter((conversation) => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearchTerm ||
      conversation.customerName.toLowerCase().includes(normalizedSearchTerm) ||
      conversation.username.toLowerCase().includes(normalizedSearchTerm) ||
      (conversation.lastMessage?.toLowerCase().includes(normalizedSearchTerm) ?? false);
    const matchesPlatform =
      platformFilter === "All" || conversation.platform === platformFilter;
    const matchesStatus =
      statusFilter === "All" || conversation.status === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  useEffect(() => {
    async function loadInbox() {
      try {
        setLoading(true);

        setError(null);
        const result = await dataSource.getInbox(organizationId);

        setConversations(result);

      } catch (loadError) {
        setError(getInboxErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    loadInbox();
  }, [dataSource, organizationId]);

  async function handleSelectConversation(conversationId: string) {
    try {
      setSelectedConversationId(conversationId);

      setAnalysisState({
        data: null,
        isLoading: false,
        error: null,
      });

      const result = await dataSource.getConversation(conversationId);

      setSelectedConversation(result);

      await loadPendingActions(conversationId);
    } catch (loadError) {
      setSelectedConversationId(null);
      setError(getConversationErrorMessage(loadError));
    }
  }

  function handleBackToInbox() {
    setSelectedConversationId(null);
    setSelectedConversation(null);
    setAnalysisState({ data: null, isLoading: false, error: null });
    setAgentReplyState({ data: null, isLoading: false, error: null });
    setAgentActionsState({ data: [], isLoading: false, error: null });
  }

  async function handleSendMessage(content: string) {
    if (!selectedConversationId) {
      return;
    }

    if (isMockMode) {
      const updatedConversation = await addMockMessage(selectedConversationId, content);
      setSelectedConversation(updatedConversation);
      setConversations(await getMockInbox());
      return;
    }

    await addMessage(selectedConversationId, {
      direction: "Outbound",
      senderType: "HumanAgent",
      content,
      externalMessageId: null,
    });

    await refreshConversation(selectedConversationId);
  }

  async function handleRetryMessage(messageId: string) {
    if (!selectedConversationId || isMockMode) {
      return;
    }

    await retryMessage(selectedConversationId, messageId);

    await refreshConversation(selectedConversationId);
  }

  async function refreshConversation(conversationId: string) {
    const [updatedConversation, updatedInbox] = await Promise.all([
      dataSource.getConversation(conversationId),
      dataSource.getInbox(organizationId),
    ]);

    setSelectedConversation(updatedConversation);
    setConversations(updatedInbox);
  }

  async function handleAnalyzeMessage() {
    if (!selectedConversationId) return;

    try {
      setAnalysisState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      const result = isMockMode
        ? await analyzeMockConversation(selectedConversationId)
        : await analyzeConversation(selectedConversationId);

      setAnalysisState({
        data: result,
        isLoading: false,
        error: null,
      });
    } catch {
      setAnalysisState({
        data: null,
        isLoading: false,
        error: "Unable to analyze this conversation.",
      });
    }
  }

  async function handleGenerateAgentReply() {
    if (!selectedConversationId) {
      return;
    }

    try {
      setAgentReplyState({
        data: null,
        isLoading: true,
        error: null,
      });

      const result = isMockMode
        ? await generateMockAgentReply(selectedConversationId)
        : await generateAgentReply(selectedConversationId);

      setAgentReplyState({
        data: result,
        isLoading: false,
        error: null,
      });

      await loadPendingActions(selectedConversationId);
    } catch {
      setAgentReplyState({
        data: null,
        isLoading: false,
        error: "Unable to generate agent reply.",
      });
    }
  }

  async function loadPendingActions(conversationId: string) {
    try {
      setAgentActionsState({
        data: [],
        isLoading: true,
        error: null,
      });

      const actions = isMockMode
        ? await getMockPendingActions(conversationId)
        : await getPendingAgentActions(conversationId);

      setAgentActionsState({
        data: actions,
        isLoading: false,
        error: null,
      });
    } catch {
      setAgentActionsState({
        data: [],
        isLoading: false,
        error: "Unable to load pending actions.",
      });
    }
  }

  async function handleApproveAction(actionId: string) {
    if (!selectedConversationId) return;

    try {
      if (isMockMode) {
        await resolveMockPendingAction(actionId);
      } else {
        await approveAgentAction(actionId);
      }

      await loadPendingActions(selectedConversationId);
    } catch {
      setAgentActionsState((current) => ({
        ...current,
        error: "Unable to approve action.",
      }));
    }
  }

  async function handleRejectAction(actionId: string) {
    if (!selectedConversationId) return;

    try {
      if (isMockMode) {
        await resolveMockPendingAction(actionId);
      } else {
        await rejectAgentAction(actionId);
      }

      await loadPendingActions(selectedConversationId);
    } catch {
      setAgentActionsState((current) => ({
        ...current,
        error: "Unable to reject action.",
      }));
    }
  }

  if (loading) {
    return (
      <main className="overflow-hidden rounded-lg border border-line bg-surface" aria-busy="true">
        <span className="sr-only">Loading inbox...</span>
        <SkeletonRows rows={6} columns={4} />
      </main>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <Alert showIcon type="error" title={error} />
      </div>
    );
  }

  if (selectedConversationId) {
    return (
      <main className="h-[calc(100vh-88px)] min-w-0 overflow-hidden rounded-lg border border-line bg-surface sm:h-[calc(100vh-104px)]">
        <ConversationDetailsView
          conversation={selectedConversation}
          onBack={handleBackToInbox}
          onSendMessage={handleSendMessage}
          onRetryMessage={handleRetryMessage}
          analysisState={analysisState}
          onAnalyze={handleAnalyzeMessage}
          onSuggestReply={handleGenerateAgentReply}
          agentReplyState={agentReplyState}
          onApproveAction={handleApproveAction}
          onRejectAction={handleRejectAction}
          agentActionsState={agentActionsState}
        />
      </main>
    );
  }

  return (
    <main className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <Input.Search
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search conversations"
          className="max-w-md flex-1"
          allowClear
        />

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select
            className="min-w-36"
            aria-label="Filter by platform"
            value={platformFilter}
            onChange={(value) => setPlatformFilter(value)}
            options={[
              { value: "All", label: "All platforms" },
              { value: "Instagram", label: "Instagram" },
              { value: "Facebook", label: "Facebook" },
              { value: "WhatsApp", label: "WhatsApp" },
              { value: "TikTok", label: "TikTok" },
              { value: "X", label: "X" },
            ]}
          />

          <Select
            className="min-w-32"
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "All", label: "All statuses" },
              { value: "Open", label: "Open" },
              { value: "Pending", label: "Pending" },
              { value: "Escalated", label: "Escalated" },
              { value: "Resolved", label: "Resolved" },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-line bg-inset px-4 py-1.5 sm:px-5">
        <span className="tnum text-xs text-fg-muted">
          {filteredConversations.length} of {conversations.length} conversations
        </span>
        <Badge tone={isMockMode ? "neutral" : "success"} icon={<span className={`size-1.5 rounded-full ${isMockMode ? "bg-fg-muted" : "bg-success"}`} />}>
          {isMockMode ? "Mock mode" : "Live API"}
        </Badge>
      </div>

      <ConversationList
        conversations={filteredConversations}
        onSelect={handleSelectConversation}
      />
    </main>
  );
}

function getInboxErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session has expired. Sign in again.";
    if (error.status === 403) return "You do not have access to this organization inbox.";
    if (error.status && error.status >= 500) return "The inbox service is temporarily unavailable.";
    return error.message;
  }

  return "Unable to load inbox.";
}

function getConversationErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) return "The selected conversation no longer exists.";
    if (error.status === 403) return "You do not have access to this conversation.";
    if (error.status && error.status >= 500) return "The conversation service is temporarily unavailable.";
    return error.message;
  }

  return "Unable to load conversation.";
}
