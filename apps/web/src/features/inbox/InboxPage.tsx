import { useEffect, useState } from "react";

import {
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

  if (loading) {
    return <p>Loading inbox...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        height: "100vh",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #ddd",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            padding: "16px",
            margin: 0,
          }}
        >
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

      <main
        style={{
          overflowY: "auto",
        }}
      >
        <ConversationDetailsView
          conversation={
            selectedConversation
          }
        />
      </main>
    </div>
  );
}