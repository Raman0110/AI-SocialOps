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
    return (
      <p className="px-4 py-6 text-sm text-slate-500">
        No conversations yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`block w-full cursor-pointer px-4 py-4 text-left transition hover:bg-slate-50 ${selectedConversationId === conversation.id
            ? "bg-sky-50"
            : "bg-white"
            }`}
        >
          <div className="flex items-start justify-between gap-3">
            <strong className="truncate text-sm font-semibold text-slate-950">
              {conversation.customerName}
            </strong>

            <span className="shrink-0 text-xs font-medium text-slate-500">
              {conversation.platform}
            </span>
          </div>

          <div className="mt-1 truncate text-xs text-slate-500">
            {conversation.username}
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-slate-700">
            {conversation.lastMessage ?? "No messages"}
          </p>

          <small className="mt-3 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {conversation.status}
          </small>
        </button>
      ))}
    </div>
  );
}
