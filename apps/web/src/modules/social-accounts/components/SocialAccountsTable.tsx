import {
  CheckCircleOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SocialAccount, WebhookHealth } from "../types/socialAccounts";

const { Text } = Typography;

interface SocialAccountsTableProps {
  accounts: SocialAccount[];
  selectedAccountId: string | null;
  onSelect: (accountId: string) => void;
}

export function SocialAccountsTable({
  accounts,
  selectedAccountId,
  onSelect,
}: SocialAccountsTableProps) {
  return (
    <Table
      rowKey="id"
      size="middle"
      pagination={false}
      dataSource={accounts}
      columns={columns}
      rowClassName={(account) =>
        account.id === selectedAccountId ? "cursor-pointer bg-blue-50" : "cursor-pointer"
      }
      onRow={(account) => ({
        onClick: () => onSelect(account.id),
      })}
      locale={{ emptyText: "No social accounts match your filters." }}
    />
  );
}

const columns: ColumnsType<SocialAccount> = [
  {
    title: "Account",
    dataIndex: "displayName",
    render: (_value, account) => (
      <div>
        <Text strong>{account.displayName}</Text>
        <Text type="secondary" className="block text-xs">
          {account.handle}
        </Text>
      </div>
    ),
  },
  {
    title: "Platform",
    dataIndex: "platform",
    render: (platform: SocialAccount["platform"]) => (
      <Tag color={platformColors[platform]}>{platform}</Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: SocialAccount["status"]) => (
      <Tag icon={accountStatusIcons[status]} color={statusColors[status]}>
        {status}
      </Tag>
    ),
  },
  {
    title: "Webhook",
    dataIndex: ["webhook", "health"],
    render: (health: WebhookHealth) => <Tag color={healthColors[health]}>{health}</Tag>,
  },
  {
    title: "External account id",
    dataIndex: "externalAccountId",
    render: (value: string) => <Text code>{value}</Text>,
  },
  {
    title: "Open",
    dataIndex: "openConversations",
    align: "right",
  },
];

const platformColors: Record<SocialAccount["platform"], string> = {
  Instagram: "magenta",
  Facebook: "blue",
  X: "default",
  TikTok: "purple",
  WhatsApp: "green",
};

const statusColors: Record<SocialAccount["status"], string> = {
  Connected: "success",
  "Needs reauth": "warning",
  Disabled: "default",
};

const healthColors: Record<WebhookHealth, string> = {
  Healthy: "success",
  Failing: "error",
  "Not configured": "default",
};

const accountStatusIcons: Record<SocialAccount["status"], React.ReactNode> = {
  Connected: <CheckCircleOutlined />,
  "Needs reauth": <ExclamationCircleOutlined />,
  Disabled: <DisconnectOutlined />,
};
