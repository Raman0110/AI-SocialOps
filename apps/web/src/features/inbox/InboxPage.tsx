import { useEffect, useState } from "react";

import {
  addMessage,
  analyzeConversation,
  getConversation,
  getInbox,
} from "../../api/conversations";

import type {
  ConversationDetails,
  InboxConversation,
  MessageAnalysis,
} from "../../types/conversations";
import {
  MessageDirection,
  MessageSenderType,
} from "../../types/conversations";

import { ConversationList } from "./ConversationList";
import { ConversationDetails as ConversationDetailsView } from "./ConversationDetails";
import { generateAgentReply } from "../../api/ai";
import type { PendingAgentAction } from "../../types/agentActions";
import { approveAgentAction, getPendingAgentActions, rejectAgentAction } from "../../api/agentActions";

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

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [
    suggestedReplyState,
    setSuggestedReplyState,
  ] = useState<SuggestedReplyState>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    async function loadInbox() {
      try {
        setLoading(true);

        const result = await getInbox(organizationId);

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

      setSuggestedReplyState({
        data: null,
        isLoading: false,
        error: null,
      });

      const result = await getConversation(conversationId);

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

    await addMessage(selectedConversationId, {
      direction: MessageDirection.Outbound,
      senderType: MessageSenderType.HumanAgent,
      content,
      externalMessageId: null,
    });

    const updatedConversation = await getConversation(selectedConversationId);

    setSelectedConversation(updatedConversation);

    const updatedInbox = await getInbox(organizationId);

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

      const result = await analyzeConversation(selectedConversationId);

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

  async function handleSuggestReply() {
    if (!selectedConversationId) return;

    try {
      setSuggestedReplyState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      const result = await generateAgentReply(selectedConversationId);

      setSuggestedReplyState({
        data: result.reply,
        isLoading: false,
        error: null,
      });

      await loadPendingActions(selectedConversationId);
    } catch {
      setSuggestedReplyState({
        data: null,
        isLoading: false,
        error: "Unable to generate a suggested reply.",
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

      const actions = await getPendingAgentActions(conversationId);

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
      await approveAgentAction(actionId);

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
      await rejectAgentAction(actionId);

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
    <div className="grid h-screen bg-slate-50 text-slate-950 md:grid-cols-[360px_1fr]">
      <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-4 py-4 text-base font-semibold">
          Unified Inbox
        </h2>

        <ConversationList
          conversations={conversations}
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
          onSuggestReply={handleSuggestReply}
          suggestedReplyState={suggestedReplyState}
          onApproveAction={handleApproveAction}
          onRejectAction={handleRejectAction}
          agentActionsState={agentActionsState}
        />
      </main>
    </div>
  );
}
