import { useEffect, useMemo, useState } from "react";
import { Alert, Button } from "antd";
import { EmptyState, Metric, Panel, PanelHeader, SkeletonRows, StatusBadge } from "../../../shared/ui";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  MessageOutlined,
  RobotOutlined,
} from "../../../shared/icons";
import { SandboxScenarioLauncher } from "../components/SandboxScenarioLauncher";
import {
  defaultDashboardDataSource,
  type DashboardDataSource,
} from "../services/dashboardDataSource";
import {
  sandboxScenarios,
  type SandboxScenario,
  type SandboxScenarioId,
} from "../types/sandboxScenarios";
import type { InboxConversation } from "../../inbox/types/conversations";

interface DashboardPageProps {
  organizationId: string;
  onOpenInbox: () => void;
  onOpenAiActions: () => void;
  dataSource?: DashboardDataSource;
}

export function DashboardPage({
  organizationId,
  onOpenInbox,
  onOpenAiActions,
  dataSource = defaultDashboardDataSource,
}: DashboardPageProps) {
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [launchingScenarioId, setLaunchingScenarioId] = useState<SandboxScenarioId | null>(null);
  const [createdScenario, setCreatedScenario] = useState<SandboxScenario | null>(null);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const refreshDashboard = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    setLoadError(null);

    try {
      setConversations(await dataSource.getInbox(organizationId));
    } catch {
      setLoadError("Unable to load dashboard data. Confirm the API is running and your API key is valid.");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const result = await dataSource.getInbox(organizationId);

        if (active) {
          setConversations(result);
          setLoadError(null);
        }
      } catch {
        if (active) {
          setLoadError("Unable to load dashboard data. Confirm the API is running and your API key is valid.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [dataSource, organizationId]);

  const handleLaunchScenario = async (scenario: SandboxScenario) => {
    setLaunchingScenarioId(scenario.id);
    setCreatedScenario(null);
    setScenarioError(null);

    try {
      const result = await dataSource.launchScenario(scenario);

      if (!result.accepted || !result.conversationId) {
        throw new Error("The webhook did not accept the scenario.");
      }

      setCreatedScenario(scenario);
      await refreshDashboard(false);
    } catch {
      setScenarioError(
        dataSource.mode === "api"
          ? "Confirm the API is running in Development with the sandbox webhook enabled."
          : "The mock scenario could not be created.",
      );
    } finally {
      setLaunchingScenarioId(null);
    }
  };

  const stats = useMemo(() => {
    const open = conversations.filter(({ status }) =>
      status === "Open" || status === "Pending" || status === "Escalated").length;
    const resolved = conversations.filter(({ status }) => status === "Resolved").length;
    const escalated = conversations.filter(({ status }) => status === "Escalated").length;

    return [
      { label: "Total conversations", value: String(conversations.length), hint: "All conversations across connected channels." },
      { label: "Open conversations", value: String(open), hint: "Conversations that are open, pending, or escalated." },
      { label: "Resolved", value: String(resolved), hint: "Conversations marked resolved." },
      { label: "Escalated", value: String(escalated), hint: "Conversations escalated to a human agent." },
    ];
  }, [conversations]);

  const channels = useMemo(() => {
    return Object.entries(
      conversations.reduce<Record<string, number>>((counts, conversation) => {
        counts[conversation.platform] = (counts[conversation.platform] ?? 0) + 1;
        return counts;
      }, {}),
    ).map(([label, value]) => ({ label, value }));
  }, [conversations]);

  const recentActivity = useMemo(() => {
    return conversations.slice(0, 3).map((conversation) => ({
      customer: conversation.customerName,
      detail: conversation.lastMessage ?? "No messages yet",
      time: conversation.lastMessageAt
        ? new Date(conversation.lastMessageAt).toLocaleString()
        : "—",
      status: conversation.status,
    }));
  }, [conversations]);

  const activeCount = conversations.filter(({ status }) => status !== "Resolved").length;
  const pendingCount = conversations.filter(({ status }) => status === "Pending").length;
  const escalatedCount = conversations.filter(({ status }) => status === "Escalated").length;
  const totalConversations = conversations.length;

  const maxChannel = Math.max(1, ...channels.map((channel) => channel.value));

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      {loadError && (
        <Alert
          type="error"
          showIcon
          message="Dashboard data is unavailable"
          description={loadError}
          action={<Button onClick={() => void refreshDashboard()}>Retry</Button>}
        />
      )}

      {/* KPIs: one panel, cells split by hairlines */}
      <Panel aria-label="Key metrics" className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <article
            key={stat.label}
            className={`p-4 sm:px-5 ${index % 2 === 1 ? "border-l border-line" : ""} ${
              index > 1 ? "border-t border-line lg:border-t-0" : ""
            } ${index > 0 ? "lg:border-l" : ""}`}
          >
            <Metric
              label={stat.label}
              value={stat.value}
              description={stat.hint}
              loading={isLoading}
              tone={index === 3 ? "danger" : "default"}
            />
          </article>
        ))}
      </Panel>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Recent conversations"
            description="Latest customer activity across all channels"
            actions={
              <Button type="text" size="small" onClick={onOpenInbox} className="!text-accent-fg">
                View all <ArrowRightOutlined />
              </Button>
            }
          />

          <div role="list" className="border-t border-line">
            {isLoading ? (
              <SkeletonRows rows={3} columns={3} />
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.customer}
                  role="listitem"
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 border-b border-line px-5 py-2.5 transition-colors duration-150 last:border-b-0 hover:bg-surface-hover sm:grid-cols-[150px_minmax(0,1fr)_auto_auto]"
                >
                  <span className="truncate text-[13px] font-medium text-fg">{activity.customer}</span>
                  <span className="order-last col-span-2 truncate text-[13px] text-fg-muted sm:order-none sm:col-span-1">
                    {activity.detail}
                  </span>
                  <StatusBadge status={activity.status} />
                  <span className="tnum text-right text-xs text-fg-muted sm:min-w-32">{activity.time}</span>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<MessageOutlined />}
                title="No conversations yet"
                description="Launch a sandbox scenario below to create one."
              />
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Customer operations" description="Today’s support workload" />
          <dl className="m-0 grid grid-cols-3 divide-x divide-line border-t border-line">
            <SummaryStat value={isLoading ? null : activeCount} label="Active" />
            <SummaryStat value={isLoading ? null : pendingCount} label="Pending" />
            <SummaryStat value={isLoading ? null : escalatedCount} label="Escalated" />
          </dl>
          <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
            <Button type="primary" icon={<MessageOutlined />} onClick={onOpenInbox}>
              Open inbox
            </Button>
            <Button icon={<RobotOutlined />} onClick={onOpenAiActions}>
              Review AI actions
            </Button>
          </div>

          <div className="border-t border-line">
            <PanelHeader
              title="Conversation overview"
              description="Distribution across connected channels"
              actions={<span className="tnum text-xs text-fg-muted">{totalConversations.toLocaleString()} total</span>}
            />
            {channels.length > 0 ? (
              <ul className="m-0 list-none space-y-3 px-5 pb-5 pt-1">
                {channels.map((channel, index) => (
                  <li key={channel.label}>
                    <div className="mb-1 flex items-baseline justify-between text-[13px]">
                      <span className="font-medium text-fg">{channel.label}</span>
                      <span className="tnum text-fg-muted">{channel.value}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-inset">
                      <div
                        className={`h-full rounded-full transition-[width] duration-150 ${
                          index === 0 ? "bg-accent" : "bg-line-strong"
                        }`}
                        style={{ width: `${(channel.value / maxChannel) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<AppstoreOutlined />} title="No conversations yet" description="Channel activity will appear here." />
            )}
          </div>
        </Panel>
      </div>

      <SandboxScenarioLauncher
        scenarios={sandboxScenarios}
        launchingScenarioId={launchingScenarioId}
        createdScenario={createdScenario}
        error={scenarioError}
        onLaunch={(scenario) => void handleLaunchScenario(scenario)}
        onOpenInbox={onOpenInbox}
      />
    </div>
  );
}

function SummaryStat({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col-reverse px-5 py-3">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="tnum m-0 text-xl font-semibold leading-7 text-fg">{value ?? "–"}</dd>
    </div>
  );
}
