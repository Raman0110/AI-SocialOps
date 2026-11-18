import type { ColumnsType } from "antd/es/table";
import { LinkOutlined } from "../../../shared/icons";
import {
  CopyableId,
  DataTable,
  EmptyState,
  PlatformBadge,
  StatusBadge,
  TruncatedText,
} from "../../../shared/ui";
import type { SocialAccount, WebhookHealth } from "../types/socialAccounts";

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
    <DataTable<SocialAccount>
      rows={accounts}
      rowId={(account) => account.id}
      selectedId={selectedAccountId}
      onSelect={(account) => onSelect(account.id)}
      columns={columns}
      empty={<EmptyState icon={<LinkOutlined />} title="No social accounts match your filters." description="Clear a filter or connect a new account." />}
    />
  );
}

const columns: ColumnsType<SocialAccount> = [
  {
    title: "Account",
    dataIndex: "displayName",
    width: 220,
    render: (_value, account) => (
      <div className="max-w-52">
        <span className="block truncate text-[13px] font-medium text-fg">{account.displayName}</span>
        <TruncatedText className="text-xs text-fg-muted" text={account.handle} />
      </div>
    ),
  },
  {
    title: "Platform",
    dataIndex: "platform",
    render: (platform: SocialAccount["platform"]) => <PlatformBadge platform={platform} />,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: SocialAccount["status"]) => <StatusBadge status={status} />,
  },
  {
    title: "Webhook",
    dataIndex: ["webhook", "health"],
    render: (health: WebhookHealth) => <StatusBadge status={health} />,
  },
  {
    title: "External account id",
    dataIndex: "externalAccountId",
    render: (value: string) => <CopyableId value={value} visible={24} />,
  },
  {
    title: "Open",
    dataIndex: "openConversations",
    align: "right",
    width: 80,
    render: (value: number) => <span className="tnum text-[13px] text-fg">{value}</span>,
  },
];
