import { useEffect, useState } from "react";

import {
  addMessage,
  getConversation,
  getInbox,
} from "../../api/conversations";

import type {
  ConversationDetails,
  InboxConversation,
} from "../../types/conversations";

import { ConversationList } from "./ConversationList";
import { ConversationDetails as ConversationDetailsView } from "./ConversationDetails";

interface InboxPageProps {
  organizationId: string;
}

export function InboxPage({ organizationId }: InboxPageProps) {
  const [conversations, setConversations] = useState<InboxConversation[]>([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(null);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<ConversationDetails | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInbox() {
      try {
        setLoading(true);

        const result =
          await getInbox(organizationId);

        setConversations(result);
      } catch {
        setError("Unable to load inbox.");
      } finally {
        setLoading(false);
      }
    }

    loadInbox();
  }, [organizationId]);

  async function handleSelectConversation(
    conversationId: string
  ) {
    try {
      setSelectedConversationId(
        conversationId
      );

      const result =
        await getConversation(
          conversationId
        );

      setSelectedConversation(result);
    } catch {
      setError(
        "Unable to load conversation."
      );
    }
  }

  async function handleSendMessage(
    content: string
  ) {
    if (!selectedConversationId) {
      return;
    }

    await addMessage(
      selectedConversationId,
      {
        direction: "Outbound",
        senderType: "HumanAgent",
        content,
        externalMessageId: null,
      }
    );

    const updatedConversation =
      await getConversation(
        selectedConversationId
      );

    setSelectedConversation(
      updatedConversation
    );

    const updatedInbox =
      await getInbox(
        organizationId
      );

    setConversations(
      updatedInbox
    );
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
          selectedConversationId={
            selectedConversationId
          }
          onSelect={
            handleSelectConversation
          }
        />
      </aside>

      <main className="min-h-0 overflow-y-auto">
        <ConversationDetailsView
          conversation={selectedConversation}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
}
