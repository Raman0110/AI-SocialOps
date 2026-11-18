import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Input, Select, message } from "antd";
import { SkeletonRows } from "../../../shared/ui";
import { LinkOutlined } from "../../../shared/icons";
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
  const [detailOpen, setDetailOpen] = useState(false);
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
      <div className="overflow-hidden rounded-lg border border-line bg-surface" aria-busy="true">
        <span className="sr-only">Loading social accounts...</span>
        <SkeletonRows rows={5} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <Alert showIcon type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col gap-4 sm:h-[calc(100vh-104px)]">
      {contextHolder}

      <section className="shrink-0 rounded-lg border border-line bg-surface px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div>
            <h2 className="m-0 text-sm font-semibold text-fg">Connected channels</h2>
            <p className="tnum m-0 text-xs text-fg-muted">
              {filteredAccounts.length} of {accounts.length} organization-owned social accounts
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <Input.Search
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search account, handle, or external id"
              allowClear
              className="sm:w-72"
            />
            <Select
              aria-label="Filter by platform"
              className="sm:w-36"
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
              aria-label="Filter by status"
              className="sm:w-36"
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
              aria-label="Filter by webhook state"
              className="sm:w-40"
              value={webhookFilter}
              onChange={(value) => setWebhookFilter(value)}
              options={[
                { value: "All", label: "All webhook states" },
                { value: "Healthy", label: "Healthy" },
                { value: "Failing", label: "Failing" },
                { value: "Not configured", label: "Not configured" },
              ]}
            />
            <Button type="primary" icon={<LinkOutlined />} onClick={handleConnectAccount}>
              Connect account
            </Button>
          </div>
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="min-h-0 min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
          <SocialAccountsTable
            accounts={filteredAccounts}
            selectedAccountId={visibleSelectedAccountId}
            onSelect={(accountId) => {
              setSelectedAccountId(accountId);
              setDetailOpen(true);
            }}
          />
        </section>

        <main
          className={`min-h-0 min-w-0 overflow-hidden bg-surface xl:static xl:z-auto xl:block xl:rounded-lg xl:border xl:border-line ${
            detailOpen ? "fixed inset-0 z-40 block" : "hidden"
          }`}
        >
          <SocialAccountDetails
            account={selectedAccount}
            onConnectAccount={handleConnectAccount}
            onReauthorize={handleReauthorize}
            onClose={() => setDetailOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}
