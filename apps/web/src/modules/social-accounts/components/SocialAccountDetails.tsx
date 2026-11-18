import {
  ApiOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Descriptions, Empty, Space, Statistic, Tag, Typography } from "antd";
import type { SocialAccount, SocialAccountStatus, WebhookHealth } from "../types/socialAccounts";

const { Paragraph, Text, Title } = Typography;

interface SocialAccountDetailsProps {
  account: SocialAccount | null;
  onConnectAccount: () => void;
  onReauthorize: () => void;
}

export function SocialAccountDetails({
  account,
  onConnectAccount,
  onReauthorize,
}: SocialAccountDetailsProps) {
  if (!account) {
    return (
      <div className="grid h-full place-items-center p-8">
        <Empty description="Select a social account to inspect connection health." />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Space wrap className="mb-2">
              <Title level={3} className="mb-0">
                {account.displayName}
              </Title>
              <Tag color={platformColors[account.platform]}>{account.platform}</Tag>
              <Tag color={statusColors[account.status]}>{account.status}</Tag>
            </Space>
            <Text type="secondary" className="block">
              {account.handle} · {account.organizationName}
            </Text>
          </div>

          <Space wrap>
            <Button icon={<LinkOutlined />} onClick={onConnectAccount}>
              Connect account
            </Button>
            <Button
              type={account.status === "Needs reauth" ? "primary" : "default"}
              icon={<ReloadOutlined />}
              onClick={onReauthorize}
            >
              Reauthorize
            </Button>
          </Space>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card size="small" className="">
            <Statistic title="Conversations today" value={account.conversationsToday} />
          </Card>
          <Card size="small" className="">
            <Statistic title="Open conversations" value={account.openConversations} />
          </Card>
          <Card size="small" className="">
            <Statistic title="Webhook failures" value={account.webhook.failureCount} />
          </Card>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card title="Connection details" className="">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="External account id">
              <Text code>{account.externalAccountId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Connected by">{account.connectedBy}</Descriptions.Item>
            <Descriptions.Item label="Connected at">
              {formatDateTime(account.connectedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Last synced">
              {formatDateTime(account.lastSyncedAt)}
            </Descriptions.Item>
          </Descriptions>

          <Paragraph className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            This account represents the organization-owned channel that receives inbound
            customer messages. Incoming webhook payloads use the external account id to
            resolve which company account should receive the message.
          </Paragraph>
        </Card>

        <Card title="Webhook health" className="">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <Space align="start">
              <span className={`mt-1 text-lg ${healthTextColors[account.webhook.health]}`}>
                {healthIcons[account.webhook.health]}
              </span>
              <div>
                <Text strong>{account.webhook.health}</Text>
                <Text type="secondary" className="block text-xs">
                  Last event:{" "}
                  {account.webhook.lastReceivedAt
                    ? formatDateTime(account.webhook.lastReceivedAt)
                    : "No webhook received yet"}
                </Text>
              </div>
            </Space>
          </div>

          <Descriptions column={1} size="small" className="mt-4">
            <Descriptions.Item label="Webhook id">
              <Text code>{account.webhook.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Endpoint">
              <Text copyable className="break-all">
                {account.webhook.url}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Subscribed events">
              <Space wrap>
                {account.webhook.subscribedEvents.length > 0 ? (
                  account.webhook.subscribedEvents.map((event) => (
                    <Tag key={event} icon={<ApiOutlined />}>
                      {event}
                    </Tag>
                  ))
                ) : (
                  <Tag>None</Tag>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

const platformColors: Record<SocialAccount["platform"], string> = {
  Instagram: "magenta",
  Facebook: "blue",
  X: "default",
  TikTok: "purple",
  WhatsApp: "green",
};

const statusColors: Record<SocialAccountStatus, string> = {
  Connected: "success",
  "Needs reauth": "warning",
  Disabled: "default",
};

const healthTextColors: Record<WebhookHealth, string> = {
  Healthy: "text-emerald-600",
  Failing: "text-red-600",
  "Not configured": "text-slate-500",
};

const healthIcons: Record<WebhookHealth, React.ReactNode> = {
  Healthy: <CheckCircleOutlined />,
  Failing: <ExclamationCircleOutlined />,
  "Not configured": <ClockCircleOutlined />,
};
