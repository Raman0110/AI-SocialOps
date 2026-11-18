import { MessageOutlined } from "../../../shared/icons";
import { EmptyState, PlatformBadge, StatusBadge } from "../../../shared/ui";
import type { InboxConversation } from "../types/conversations";

interface ConversationListProps {
  conversations: InboxConversation[];
  onSelect: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageOutlined />}
        title="No conversations yet."
        description="New messages from connected accounts will appear here."
      />
    );
  }

  return (
    <ul className="m-0 list-none p-0">
      {conversations.map((conversation) => (
        <li key={conversation.id} className="border-b border-line last:border-b-0">
          <button
            className="group grid min-h-14 w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 bg-surface px-4 py-2.5 text-left transition-colors duration-150 hover:bg-surface-hover focus-visible:z-10 sm:grid-cols-[auto_180px_minmax(0,1fr)_112px_auto] sm:px-5"
            onClick={() => onSelect(conversation.id)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-full bg-inset text-xs font-medium text-fg-secondary"
            >
              {conversation.customerName.slice(0, 1).toUpperCase()}
            </span>

            <div className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-fg">
                {conversation.customerName}
              </span>
              <span className="block truncate text-xs text-fg-muted sm:hidden">
                {conversation.username}
              </span>
            </div>

            <div className="col-span-2 min-w-0 sm:col-span-1">
              <span className="block truncate text-[13px] text-fg-muted">
                <span className="font-medium text-fg-secondary">{conversation.username}</span>
                <span className="mx-2 text-line-strong">—</span>
                {conversation.lastMessage ?? "No messages"}
              </span>
            </div>

            <div className="hidden sm:block">
              <PlatformBadge platform={conversation.platform} />
            </div>

            <div className="flex min-w-20 flex-col items-end gap-1">
              <span className="tnum whitespace-nowrap text-xs text-fg-muted">
                {formatConversationDate(conversation.lastMessageAt)}
              </span>
              <StatusBadge status={conversation.status} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function formatConversationDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  return new Intl.DateTimeFormat(
    undefined,
    isToday
      ? { hour: "numeric", minute: "2-digit" }
      : { month: "short", day: "numeric" },
  ).format(date);
}
