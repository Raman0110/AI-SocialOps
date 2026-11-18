import { Button, Tabs } from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CodeOutlined,
  CloseOutlined,
  RobotOutlined,
} from "../../../shared/icons";
import { Badge, CopyableId, EmptyState, Inset, KeyValue, PlatformBadge, RiskBadge, StatusBadge } from "../../../shared/ui";
import type { AiAction } from "../types/aiActions";

interface AiActionDetailsProps {
  action: AiAction | null;
  onApprove: (actionId: string) => Promise<void>;
  onReject: (actionId: string) => Promise<void>;
  isResolving: boolean;
  /** Closes the slide-over on small screens. */
  onClose?: () => void;
}

/** Inspector: sticky header with state and actions, tabbed body. */
export function AiActionDetails({
  action,
  onApprove,
  onReject,
  isResolving,
  onClose,
}: AiActionDetailsProps) {
  if (!action) {
    return (
      <div className="grid h-full place-items-center">
        <EmptyState icon={<RobotOutlined />} title="Select an AI action to review." />
      </div>
    );
  }

  const canResolve = action.status === "Pending";

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
            <h2 className="m-0 truncate text-base font-semibold leading-6 text-fg">{action.type}</h2>
            <p className="m-0 truncate text-xs text-fg-muted">
              {action.customerName} · {action.conversationTopic}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="small"
              icon={<CloseOutlined />}
              disabled={!canResolve}
              loading={isResolving}
              onClick={() => onReject(action.id)}
            >
              Reject
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              disabled={!canResolve}
              loading={isResolving}
              onClick={() => onApprove(action.id)}
            >
              Approve
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={action.status} />
          <RiskBadge level={action.risk} />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-5">
        <Tabs
          size="small"
          items={[
            {
              key: "payload",
              label: "Proposed payload",
              children: (
                <Inset>
                  <KeyValue
                    items={Object.entries(action.payload).map(([key, value]) => ({
                      label: formatLabel(key),
                      value: Array.isArray(value) ? value.join(", ") : value,
                    }))}
                  />
                </Inset>
              ),
            },
            {
              key: "reasoning",
              label: "Reasoning",
              children: (
                <div className="space-y-4">
                  <p className="m-0 text-[13px] leading-5 text-fg-secondary">{action.reasoning}</p>
                  <div>
                    <p className="eyebrow m-0 mb-1.5">Tools used</p>
                    {action.toolsUsed.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {action.toolsUsed.map((tool) => (
                          <Badge key={tool} icon={<CodeOutlined />}>
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-fg-muted">No tools recorded.</span>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "details",
              label: "Details",
              children: (
                <KeyValue
                  items={[
                    {
                      label: "Confidence",
                      value: action.confidence === null ? null : (
                        <span className="tnum">{Math.round(action.confidence * 100)}%</span>
                      ),
                    },
                    { label: "Platform", value: <PlatformBadge platform={action.platform} /> },
                    { label: "Created", value: <span className="tnum">{formatDateTime(action.createdAt)}</span> },
                    { label: "Action ID", value: <CopyableId value={action.id} /> },
                  ]}
                />
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

function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
