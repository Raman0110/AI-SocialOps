import type { InboxConversation } from "../../types/conversations";

interface ConversationListProps {
  conversations: InboxConversation[];
  selectedConversationId: string | null;
  onSelect: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return <p>No conversations yet.</p>;
  }

  return (
    <div>
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          style={{
            width: "100%",
            display: "block",
            textAlign: "left",
            padding: "16px",
            border: "none",
            borderBottom: "1px solid #ddd",
            cursor: "pointer",
            background:
              selectedConversationId === conversation.id
                ? "#f0f0f0"
                : "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <strong>{conversation.customerName}</strong>

            <span>{conversation.platform}</span>
          </div>

          <div>{conversation.username}</div>

          <p>
            {conversation.lastMessage ?? "No messages"}
          </p>

          <small>{conversation.status}</small>
        </button>
      ))}
    </div>
  );
}