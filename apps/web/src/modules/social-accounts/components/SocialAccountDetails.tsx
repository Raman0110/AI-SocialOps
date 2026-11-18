import { Alert, Button, Tabs } from "antd";
import { ApiOutlined, ArrowLeftOutlined, LinkOutlined, ReloadOutlined } from "../../../shared/icons";
import { Badge, CopyableId, EmptyState, KeyValue, PlatformBadge, StatusBadge } from "../../../shared/ui";
import type { SocialAccount } from "../types/socialAccounts";

interface SocialAccountDetailsProps {
  account: SocialAccount | null;
  onConnectAccount: () => void;
  onReauthorize: () => void;
  /** Closes the slide-over on small screens. */
  onClose?: () => void;
}

/** Inspector: sticky header with state and actions, key facts, then tabs. */
export function SocialAccountDetails({
  account,
  onConnectAccount,
  onReauthorize,
  onClose,
}: SocialAccountDetailsProps) {
  if (!account) {
    return (
      <div className="grid h-full place-items-center">
        <EmptyState icon={<LinkOutlined />} title="Select a social account to inspect connection health." />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-line bg-surface px-4 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {onClose && (
              <Button
                type="text"
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={onClose}
                className="-ml-2 mb-1 xl:!hidden"
              >
                Back to list
              </Button>
            )}
            <h2 className="m-0 truncate text-base font-semibold leading-6 text-fg">{account.displayName}</h2>
            <p className="m-0 truncate text-xs text-fg-muted">
              {account.handle} · {account.organizationName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button size="small" icon={<LinkOutlined />} onClick={onConnectAccount}>
              Connect account
            </Button>
            <Button
              size="small"
              type={account.status === "Needs reauth" ? "primary" : "default"}
              icon={<ReloadOutlined />}
              onClick={onReauthorize}
            >
              Reauthorize
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <PlatformBadge platform={account.platform} />
          <StatusBadge status={account.status} />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <KeyValue
          items={[
            { label: "Conversations today", value: <span className="tnum">{account.conversationsToday}</span> },
            { label: "Open conversations", value: <span className="tnum">{account.openConversations}</span> },
            { label: "Webhook failures", value: <span className="tnum">{account.webhook.failureCount}</span> },
            { label: "External account id", value: <CopyableId value={account.externalAccountId} visible={24} /> },
            { label: "Connected by", value: account.connectedBy },
            { label: "Connected at", value: <span className="tnum">{formatDateTime(account.connectedAt)}</span> },
            { label: "Last synced", value: <span className="tnum">{formatDateTime(account.lastSyncedAt)}</span> },
          ]}
        />

        <Tabs
          className="mt-3"
          size="small"
          items={[
            {
              key: "webhook",
              label: "Webhook health",
              children: (
                <div className="space-y-4">
                  {account.webhook.health === "Failing" && (
                    <Alert
                      type="error"
                      showIcon
                      title="Webhook is failing"
                      description={`${account.webhook.failureCount} recent delivery failures. Last event: ${
                        account.webhook.lastReceivedAt ? formatDateTime(account.webhook.lastReceivedAt) : "none received"
                      }.`}
                    />
                  )}

                  <KeyValue
                    items={[
                      { label: "State", value: <StatusBadge status={account.webhook.health} /> },
                      {
                        label: "Last event",
                        value: account.webhook.lastReceivedAt ? (
                          <span className="tnum">{formatDateTime(account.webhook.lastReceivedAt)}</span>
                        ) : (
                          "No webhook received yet"
                        ),
                      },
                      { label: "Webhook id", value: <CopyableId value={account.webhook.id} visible={24} /> },
                      { label: "Endpoint", value: <CopyableId value={account.webhook.url} visible={40} /> },
                      {
                        label: "Subscribed events",
                        value:
                          account.webhook.subscribedEvents.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {account.webhook.subscribedEvents.map((event) => (
                                <Badge key={event} icon={<ApiOutlined />}>
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge>None</Badge>
                          ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "about",
              label: "About",
              children: (
                <p className="m-0 text-[13px] leading-5 text-fg-secondary">
                  This account represents the organization-owned channel that receives inbound
                  customer messages. Incoming webhook payloads use the external account id to
                  resolve which company account should receive the message.
                </p>
              ),
            },
          ]}
        />
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
