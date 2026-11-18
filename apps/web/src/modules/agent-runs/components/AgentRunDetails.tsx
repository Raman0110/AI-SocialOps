import { Alert, Button, Tabs } from "antd";
import {
  ApiOutlined,
  ArrowLeftOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "../../../shared/icons";
import { DashedCircleIcon, XCircleIcon } from "../../../shared/icons";
import {
  Badge,
  CopyableId,
  EmptyState,
  Inset,
  KeyValue,
  PlatformBadge,
  StatusBadge,
} from "../../../shared/ui";
import type { AgentRun, AgentRunStepStatus } from "../types/agentRuns";

interface AgentRunDetailsProps {
  run: AgentRun | null;
  isRetrying: boolean;
  onRetry: (runId: string) => Promise<void>;
  /** Closes the slide-over on small screens. */
  onClose?: () => void;
}

/** Inspector: sticky header (title, status, retry), inline failure reason, tabbed body. */
export function AgentRunDetails({ run, isRetrying, onRetry, onClose }: AgentRunDetailsProps) {
  if (!run) {
    return (
      <div className="grid h-full place-items-center">
        <EmptyState icon={<AuditOutlined />} title="Select an agent run to inspect its execution." />
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
            <h2 className="m-0 truncate text-base font-semibold leading-6 text-fg">{run.agentName}</h2>
            <p className="m-0 truncate text-xs text-fg-muted">
              {run.customerName} · {run.conversationTopic}
            </p>
          </div>

          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={isRetrying}
            disabled={run.status === "Running"}
            onClick={() => onRetry(run.id)}
          >
            Retry run
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={run.status} />
          <Badge>{run.trigger}</Badge>
          <CopyableId value={run.id} visible={13} />
        </div>

        {run.errorMessage && (
          <Alert
            className="mt-3"
            type="error"
            showIcon
            title="Run failed"
            description={<span className="line-clamp-2" title={run.errorMessage}>{run.errorMessage}</span>}
          />
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-5">
        <Tabs
          size="small"
          items={[
            {
              key: "timeline",
              label: "Execution timeline",
              children:
                run.steps.length === 0 ? (
                  <EmptyState icon={<AuditOutlined />} title="Waiting for execution steps." className="py-6" />
                ) : (
                  <ol className="m-0 list-none p-0">
                    {run.steps.map((step, index) => (
                      <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {index < run.steps.length - 1 && (
                          <span aria-hidden="true" className="absolute bottom-0 left-[8px] top-5 w-px bg-line" />
                        )}
                        <span aria-hidden="true" className={`relative z-10 mt-0.5 flex h-4 shrink-0 bg-surface text-base ${stepTone[step.status]}`}>
                          <StepIcon status={step.status} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="mono truncate font-medium text-fg">{step.name}</span>
                            <span className="tnum shrink-0 text-xs text-fg-muted">{formatDuration(step.durationMs)}</span>
                          </div>
                          <Inset className="mt-1.5 !px-2.5 !py-2">
                            <p className="mono m-0 line-clamp-3 break-all text-fg-secondary" title={step.detail}>
                              {step.detail}
                            </p>
                          </Inset>
                        </div>
                      </li>
                    ))}
                  </ol>
                ),
            },
            {
              key: "io",
              label: "Input & output",
              children: (
                <div className="space-y-4">
                  <div>
                    <p className="eyebrow m-0 mb-1.5">Input</p>
                    <Inset><p className="m-0 text-[13px] leading-5 text-fg-secondary">{run.inputSummary}</p></Inset>
                  </div>
                  <div>
                    <p className="eyebrow m-0 mb-1.5">Output</p>
                    <Inset>
                      <p className="m-0 text-[13px] leading-5 text-fg-secondary">
                        {run.outputSummary ?? "No output produced yet."}
                      </p>
                    </Inset>
                  </div>
                </div>
              ),
            },
            {
              key: "details",
              label: "Details",
              children: (
                <div className="space-y-5">
                  <KeyValue
                    items={[
                      { label: "Duration", value: <span className="tnum">{formatDuration(run.durationMs)}</span> },
                      { label: "Model", value: run.model, mono: true },
                      { label: "Platform", value: <PlatformBadge platform={run.platform} /> },
                      { label: "Started", value: <span className="tnum">{formatDateTime(run.startedAt)}</span> },
                      {
                        label: "Completed",
                        value: run.completedAt ? <span className="tnum">{formatDateTime(run.completedAt)}</span> : "Still running",
                      },
                      { label: "Prompt tokens", value: run.promptTokens === null ? null : <span className="tnum">{run.promptTokens}</span> },
                      { label: "Output tokens", value: run.completionTokens === null ? null : <span className="tnum">{run.completionTokens}</span> },
                    ]}
                  />
                  <div>
                    <p className="eyebrow m-0 mb-1.5">Tools used ({run.toolsUsed.length})</p>
                    {run.toolsUsed.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {run.toolsUsed.map((tool) => (
                          <Badge key={tool} icon={<ApiOutlined />}>
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-fg-muted">No tools called.</span>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: AgentRunStepStatus }) {
  if (status === "Completed") return <CheckCircleOutlined />;
  if (status === "Failed") return <XCircleIcon />;
  return <DashedCircleIcon />;
}

const stepTone: Record<AgentRunStepStatus, string> = {
  Completed: "text-success",
  Failed: "text-danger",
  Skipped: "text-fg-muted",
};

function formatDuration(durationMs: number | null) {
  if (durationMs === null) return "In progress";
  return durationMs < 1000 ? `${durationMs} ms` : `${(durationMs / 1000).toFixed(2)} s`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
