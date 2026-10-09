import { useEffect, useState } from "react";
import { Alert, Badge, Input, Select, Spin, Typography } from "antd";

import {
  addMockMessage,
  analyzeMockConversation,
  generateMockAgentReply,
  getMockConversation,
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
import type { AgentReplyResult } from "../../../api/ai";
import type { PendingAgentAction } from "../types/agentActions";

const { Text } = Typography;

interface InboxPageProps {
  organizationId: string;
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

export function InboxPage({ organizationId }: InboxPageProps) {
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

        const result = await getMockInbox();

        setConversations(result);

      } catch {
        setError("Unable to load inbox.");
      } finally {
        setLoading(false);
      }
    }

    loadInbox();
  }, [organizationId]);

  async function handleSelectConversation(conversationId: string) {
    try {
      setSelectedConversationId(conversationId);

      setAnalysisState({
        data: null,
        isLoading: false,
        error: null,
      });

      const result = await getMockConversation(conversationId);

      setSelectedConversation(result);

      await loadPendingActions(conversationId);
    } catch {
      setError("Unable to load conversation.");
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

    const updatedConversation = await addMockMessage(selectedConversationId, content);

    setSelectedConversation(updatedConversation);

    const updatedInbox = await getMockInbox();

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

      const result = await analyzeMockConversation(selectedConversationId);

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

      const result = await generateMockAgentReply(selectedConversationId);

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

      const actions = await getMockPendingActions(conversationId);

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
      await resolveMockPendingAction(actionId);

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
      await resolveMockPendingAction(actionId);

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
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <Spin description="Loading inbox..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <Alert showIcon type="error" message={error} />
      </div>
    );
  }

  if (selectedConversationId) {
    return (
      <main className="h-[calc(100vh-112px)] min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white app-panel-shadow">
        <ConversationDetailsView
          conversation={selectedConversation}
          onBack={handleBackToInbox}
          onSendMessage={handleSendMessage}
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
    <main className="min-h-[calc(100vh-112px)] overflow-hidden rounded-xl border border-slate-200 bg-white app-panel-shadow">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <Input.Search
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search conversations"
            className="max-w-2xl flex-1"
            size="large"
            allowClear
          />

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Select
              className="min-w-40"
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
              className="min-w-36"
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
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 sm:px-6">
        <Text type="secondary" className="text-sm">
          {filteredConversations.length} of {conversations.length} conversations
        </Text>
        <Badge color="green" text="Mock mode" />
      </div>

      <ConversationList
        conversations={filteredConversations}
        onSelect={handleSelectConversation}
      />
    </main>
  );
}
