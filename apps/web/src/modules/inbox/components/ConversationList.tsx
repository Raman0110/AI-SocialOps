import { Avatar, Empty, Space, Tag, Typography } from "antd";
import type { InboxConversation } from "../types/conversations";

const { Text } = Typography;

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
      <div className="px-4 py-10">
        <Empty description="No conversations yet." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conversation) => {
        const isSelected = selectedConversationId === conversation.id;

        return (
          <button
            key={conversation.id}
            className={`block w-full cursor-pointer px-4 py-4 text-left transition ${
              isSelected ? "bg-sky-50" : "bg-white hover:bg-slate-50"
            }`}
            onClick={() => onSelect(conversation.id)}
            type="button"
          >
            <Space align="start" className="w-full">
              <Avatar className={isSelected ? "bg-sky-600" : "bg-slate-500"}>
                {conversation.customerName.slice(0, 1)}
              </Avatar>

              <div className="min-w-0 flex-1">
                <Space className="w-full justify-between" align="start">
                  <Text strong>{conversation.customerName}</Text>
                  <Tag color={platformColors[conversation.platform]}>
                    {conversation.platform}
                  </Tag>
                </Space>

                <div className="space-y-2">
                  <Text className="block text-xs" type="secondary">
                    {conversation.username}
                  </Text>
                  <Text className="block" ellipsis>
                    {conversation.lastMessage ?? "No messages"}
                  </Text>
                  <Tag color={statusColors[conversation.status]}>
                    {conversation.status}
                  </Tag>
                </div>
              </div>
            </Space>
          </button>
        );
      })}
    </div>
  );
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
