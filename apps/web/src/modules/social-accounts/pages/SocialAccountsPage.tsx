import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Input, Select, Space, Spin, Typography, message } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { SocialAccountDetails } from "../components/SocialAccountDetails";
import { SocialAccountsTable } from "../components/SocialAccountsTable";
import {
  defaultSocialAccountDataSource,
  type SocialAccountDataSource,
} from "../services/socialAccountDataSource";
import type {
  SocialAccount,
  SocialAccountStatus,
  WebhookHealth,
} from "../types/socialAccounts";
import type { SocialPlatform } from "../../inbox/types/conversations";

const { Text, Title } = Typography;

interface SocialAccountsPageProps {
  dataSource?: SocialAccountDataSource;
}

export function SocialAccountsPage({
  dataSource = defaultSocialAccountDataSource,
}: SocialAccountsPageProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | "All">("All");
  const [statusFilter, setStatusFilter] = useState<SocialAccountStatus | "All">("All");
  const [webhookFilter, setWebhookFilter] = useState<WebhookHealth | "All">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const filteredAccounts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        account.displayName.toLowerCase().includes(normalizedSearchTerm) ||
        account.handle.toLowerCase().includes(normalizedSearchTerm) ||
        account.externalAccountId.toLowerCase().includes(normalizedSearchTerm);
      const matchesPlatform =
        platformFilter === "All" || account.platform === platformFilter;
      const matchesStatus =
        statusFilter === "All" || account.status === statusFilter;
      const matchesWebhook =
        webhookFilter === "All" || account.webhook.health === webhookFilter;

      return matchesSearch && matchesPlatform && matchesStatus && matchesWebhook;
    });
  }, [accounts, platformFilter, searchTerm, statusFilter, webhookFilter]);

  const visibleSelectedAccountId = useMemo(() => {
    if (
      selectedAccountId &&
      filteredAccounts.some((account) => account.id === selectedAccountId)
    ) {
      return selectedAccountId;
    }

    return filteredAccounts[0]?.id ?? null;
  }, [filteredAccounts, selectedAccountId]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === visibleSelectedAccountId) ?? null,
    [accounts, visibleSelectedAccountId],
  );

  useEffect(() => {
    async function loadSocialAccounts() {
      try {
        setLoading(true);
        const result = await dataSource.getSocialAccounts();
        setAccounts(result);
        setSelectedAccountId(result[0]?.id ?? null);
      } catch {
        setError("Unable to load social accounts.");
      } finally {
        setLoading(false);
      }
    }

    loadSocialAccounts();
  }, [dataSource]);

  function handleConnectAccount() {
    messageApi.info("Account connection is not available in the API yet.");
  }

  function handleReauthorize() {
    messageApi.info("Account reauthorization is not available in the API yet.");
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spin description="Loading social accounts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Alert showIcon type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-4 bg-slate-100 p-4">
      {contextHolder}

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Title level={4} className="mb-1">
              Connected channels
            </Title>
            <Text type="secondary">
              {filteredAccounts.length} of {accounts.length} organization-owned social accounts
            </Text>
          </div>

          <Button type="primary" icon={<LinkOutlined />} onClick={handleConnectAccount}>
            Connect account
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
          <Input.Search
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search account, handle, or external id"
            allowClear
          />

          <Select
            value={platformFilter}
            onChange={(value) => setPlatformFilter(value)}
            options={[
              { value: "All", label: "All platforms" },
              { value: "Instagram", label: "Instagram" },
              { value: "Facebook", label: "Facebook" },
              { value: "WhatsApp", label: "WhatsApp" },
              { value: "TikTok", label: "TikTok" },
              { value: "X", label: "X" },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "All", label: "All statuses" },
              { value: "Connected", label: "Connected" },
              { value: "Needs reauth", label: "Needs reauth" },
              { value: "Disabled", label: "Disabled" },
            ]}
          />

          <Select
            value={webhookFilter}
            onChange={(value) => setWebhookFilter(value)}
            options={[
              { value: "All", label: "All webhook states" },
              { value: "Healthy", label: "Healthy" },
              { value: "Failing", label: "Failing" },
              { value: "Not configured", label: "Not configured" },
            ]}
          />
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <SocialAccountsTable
            accounts={filteredAccounts}
            selectedAccountId={visibleSelectedAccountId}
            onSelect={setSelectedAccountId}
          />
        </section>

        <main className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <SocialAccountDetails
            account={selectedAccount}
            onConnectAccount={handleConnectAccount}
            onReauthorize={handleReauthorize}
          />
        </main>
      </div>

      <Space className="hidden" />
    </div>
  );
}
