import { Avatar, Empty, Tag, Typography } from "antd";
import type { InboxConversation } from "../types/conversations";

const { Text } = Typography;

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
      <div className="px-4 py-10">
        <Empty description="No conversations yet." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {conversations.map((conversation) => {
        return (
          <button
            key={conversation.id}
            className="group grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 sm:grid-cols-[auto_180px_minmax(0,1fr)_120px_auto] sm:px-6"
            onClick={() => onSelect(conversation.id)}
            type="button"
          >
            <Avatar className="bg-slate-700 transition-colors group-hover:bg-blue-600">
              {conversation.customerName.slice(0, 1)}
            </Avatar>

            <div className="min-w-0">
              <Text strong className="block truncate text-slate-900">
                {conversation.customerName}
              </Text>
              <Text type="secondary" className="block truncate text-xs sm:hidden">
                {conversation.username}
              </Text>
            </div>

            <div className="col-span-2 min-w-0 pl-13 sm:col-span-1 sm:pl-0">
              <Text className="block truncate text-sm text-slate-600">
                <span className="font-medium text-slate-700">{conversation.username}</span>
                <span className="mx-2 text-slate-300">—</span>
                {conversation.lastMessage ?? "No messages"}
              </Text>
            </div>

            <div className="hidden sm:block">
              <Tag color={platformColors[conversation.platform]} className="m-0">
                {conversation.platform}
              </Tag>
            </div>

            <div className="flex min-w-20 flex-col items-end gap-1.5">
              <Text type="secondary" className="whitespace-nowrap text-xs">
                {formatConversationDate(conversation.lastMessageAt)}
              </Text>
              <Tag color={statusColors[conversation.status]} className="m-0 text-xs">
                {conversation.status}
              </Tag>
            </div>
          </button>
        );
      })}
    </div>
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

const platformColors: Record<InboxConversation["platform"], string> = {
  Instagram: "magenta",
  Facebook: "blue",
  X: "default",
  TikTok: "purple",
  WhatsApp: "green",
};

const statusColors: Record<InboxConversation["status"], string> = {
  Open: "processing",
  Pending: "warning",
  Resolved: "success",
  Escalated: "error",
};
