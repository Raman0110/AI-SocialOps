import { useEffect, useState } from "react";

import {
  addMockMessage,
  analyzeMockConversation,
  generateMockAgentReply,
  getMockConversation,
  getMockInbox,
  getMockPendingActions,
  resolveMockPendingAction,
} from "../../mocks/socialopsMock";

import type {
  ConversationStatus,
  ConversationDetails,
  InboxConversation,
  MessageAnalysis,
  SocialPlatform,
} from "../../types/conversations";

import { ConversationList } from "./ConversationList";
import { ConversationDetails as ConversationDetailsView } from "./ConversationDetails";
import type { AgentReplyResult } from "../../api/ai";
import type { PendingAgentAction } from "../../types/agentActions";

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

        if (result.length > 0) {
          const firstConversationId = result[0].id;
          const firstConversation = await getMockConversation(firstConversationId);

          setSelectedConversationId(firstConversationId);
          setSelectedConversation(firstConversation);
          await loadPendingActions(firstConversationId);
        }
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
      setError(
        "Unable to load conversation."
      );
    }
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
        error:
          "Unable to generate agent reply.",
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
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6 text-sm font-medium text-slate-600">
        Loading inbox...
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="grid h-screen bg-slate-100 text-slate-950 lg:grid-cols-[240px_minmax(360px,420px)_1fr]">
      <aside className="hidden border-r border-slate-200 bg-slate-950 px-4 py-5 text-white lg:block">
        <div className="text-lg font-semibold tracking-tight">AI SocialOps</div>
        <div className="mt-1 text-xs text-slate-400">Mock workspace</div>

        <nav className="mt-8 space-y-1 text-sm">
          {["Inbox", "Customers", "Social Accounts", "AI Actions", "Agent Runs", "Settings"].map((item) => (
            <button
              key={item}
              className={`w-full rounded-md px-3 py-2 text-left transition ${
                item === "Inbox"
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300">
          <div className="font-medium text-white">Testing focus</div>
          <p className="mt-1 leading-5">
            This screen is mock-only so we can test states and interactions before wiring the API.
          </p>
        </div>
      </aside>

      <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold">Unified Inbox</h1>
              <p className="mt-1 text-xs text-slate-500">
                {filteredConversations.length} of {conversations.length} conversations
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              Mock mode
            </span>
          </div>

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search conversations"
            className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              value={platformFilter}
              onChange={(event) => setPlatformFilter(event.target.value as SocialPlatform | "All")}
              className="rounded-md border border-slate-300 px-2 py-2 text-sm outline-none"
            >
              <option value="All">All platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="TikTok">TikTok</option>
              <option value="X">X</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ConversationStatus | "All")}
              className="rounded-md border border-slate-300 px-2 py-2 text-sm outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={selectedConversationId}
          onSelect={handleSelectConversation}
        />
      </aside>

      <main className="min-h-0 overflow-y-auto">
        <ConversationDetailsView
          conversation={selectedConversation}
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
    </div>
  );
}
