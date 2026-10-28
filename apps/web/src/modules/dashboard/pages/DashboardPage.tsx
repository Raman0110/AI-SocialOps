import { useEffect, useMemo, useState } from "react";
import { Button, Typography } from "antd";
import {
  ArrowRightOutlined,
  MessageOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { getInbox } from "../../../api/conversations";
import type { InboxConversation } from "../../inbox/types/conversations";

const { Text, Title } = Typography;

interface DashboardPageProps {
  organizationId?: string;
  onOpenInbox: () => void;
  onOpenAiActions: () => void;
}

const fallbackStats = [
  { label: "Total conversations", value: "1,284", hint: "+12% this month" },
  { label: "Open conversations", value: "28", hint: "4 need attention" },
  { label: "Resolved", value: "1,156", hint: "90% resolution rate" },
  { label: "Average response", value: "4.2 min", hint: "1.1 min faster" },
];

const fallbackChannels = [
  { label: "Instagram", value: 486 },
  { label: "WhatsApp", value: 372 },
  { label: "Facebook", value: 248 },
  { label: "Other", value: 178 },
];

const fallbackRecentActivity = [
  { customer: "Maya Sharma", detail: "Delivery question", time: "2 min ago", status: "Open" },
  { customer: "Ravi Thapa", detail: "Exchange request", time: "18 min ago", status: "Pending" },
  { customer: "Sophia Lee", detail: "Support escalation", time: "1 hr ago", status: "Escalated" },
];

export function DashboardPage({
  organizationId,
  onOpenInbox,
  onOpenAiActions,
}: DashboardPageProps) {
  const [conversations, setConversations] = useState<InboxConversation[] | null>(null);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    let active = true;

    getInbox(organizationId)
      .then((result) => {
        if (active) {
          setConversations(result);
        }
      })
      .catch(() => {
        if (active) {
          setConversations([]);
        }
      });

    return () => {
      active = false;
    };
  }, [organizationId]);

  const stats = useMemo(() => {
    if (conversations === null) {
      return fallbackStats;
    }

    const open = conversations.filter(({ status }) =>
      status === "Open" || status === "Pending" || status === "Escalated").length;
    const resolved = conversations.filter(({ status }) => status === "Resolved").length;
    const escalated = conversations.filter(({ status }) => status === "Escalated").length;

    return [
      { label: "Total conversations", value: String(conversations.length), hint: "Across connected channels" },
      { label: "Open conversations", value: String(open), hint: "Open, pending, or escalated" },
      { label: "Resolved", value: String(resolved), hint: "Completed conversations" },
      { label: "Escalated", value: String(escalated), hint: "Needs human attention" },
    ];
  }, [conversations]);

  const channels = useMemo(() => {
    if (conversations === null) {
      return fallbackChannels;
    }

    return Object.entries(
      conversations.reduce<Record<string, number>>((counts, conversation) => {
        counts[conversation.platform] = (counts[conversation.platform] ?? 0) + 1;
        return counts;
      }, {}),
    ).map(([label, value]) => ({ label, value }));
  }, [conversations]);

  const recentActivity = useMemo(() => {
    if (conversations === null) {
      return fallbackRecentActivity;
    }

    return conversations.slice(0, 3).map((conversation) => ({
      customer: conversation.customerName,
      detail: conversation.lastMessage ?? "No messages yet",
      time: conversation.lastMessageAt
        ? new Date(conversation.lastMessageAt).toLocaleString()
        : "—",
      status: conversation.status,
    }));
  }, [conversations]);

  const activeCount = conversations?.filter(({ status }) => status !== "Resolved").length;
  const pendingCount = conversations?.filter(({ status }) => status === "Pending").length;
  const escalatedCount = conversations?.filter(({ status }) => status === "Escalated").length;
  const totalConversations = conversations?.length ?? 1284;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 pt-6 shadow-[0_2px_12px_rgba(15,40,70,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,40,70,0.09)]"
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-blue-100" />
            <Text className="font-semibold text-slate-700">{stat.label}</Text>
            <div className="mt-3 text-[30px] font-extrabold leading-none tracking-tight text-slate-900">
              {stat.value}
            </div>
            <Text type="secondary" className="mt-2 block text-xs font-medium">
              {stat.hint}
            </Text>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <div>
            <Title level={4} className="mb-1 text-blue-700">
              Customer operations
            </Title>
            <Text type="secondary">A quick view of today’s support workload</Text>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <SummaryTile value={String(activeCount ?? 24)} label="Active" />
            <SummaryTile value={String(pendingCount ?? 8)} label="Pending" />
            <SummaryTile value={String(escalatedCount ?? 3)} label="Escalated" />
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <Button type="primary" icon={<MessageOutlined />} onClick={onOpenInbox}>
              Open inbox
            </Button>
            <Button icon={<RobotOutlined />} onClick={onOpenAiActions}>
              Review AI actions
            </Button>
          </div>
        </section>

        <section className="flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <div>
            <Title level={4} className="mb-1 text-blue-700">
              Conversation overview
            </Title>
            <Text type="secondary">Distribution across connected channels</Text>
          </div>

          <div className="mt-6 flex flex-1 flex-wrap items-center gap-8">
            <div className="relative grid size-40 shrink-0 place-items-center rounded-full border-[18px] border-blue-100">
              <div className="absolute -inset-[18px] rounded-full border-[18px] border-blue-600 [clip-path:polygon(50%_0,100%_0,100%_100%,50%_100%)]" />
              <div className="text-center">
                <div className="text-2xl font-extrabold tracking-tight text-slate-900">{totalConversations.toLocaleString()}</div>
                <Text type="secondary" className="text-[11px] font-medium">conversations</Text>
              </div>
            </div>

            <ul className="min-w-48 flex-1 space-y-3">
              {channels.map((channel) => (
                <li key={channel.label} className="flex items-center gap-3 text-sm">
                  <span className="size-2 shrink-0 rounded-full bg-blue-600" />
                  <span className="font-medium text-slate-700">{channel.label}</span>
                  <span className="ml-auto font-semibold tabular-nums text-slate-500">
                    {channel.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,40,70,0.05)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <Title level={5} className="mb-0">Recent conversations</Title>
            <Text type="secondary" className="text-xs">Latest customer activity across all channels</Text>
          </div>
          <Button type="link" onClick={onOpenInbox} className="px-0">
            View all <ArrowRightOutlined />
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.map((activity) => (
            <div key={activity.customer} className="grid grid-cols-[1fr_auto] gap-3 px-5 py-3.5 sm:grid-cols-[180px_1fr_auto_auto] sm:items-center">
              <Text strong>{activity.customer}</Text>
              <Text type="secondary" className="truncate">{activity.detail}</Text>
              <span className="justify-self-start rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {activity.status}
              </span>
              <Text type="secondary" className="text-xs sm:min-w-16 sm:text-right">{activity.time}</Text>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
      <div className="text-xl font-extrabold tabular-nums text-slate-900">{value}</div>
      <Text type="secondary" className="text-[11px] font-medium">{label}</Text>
    </div>
  );
}
