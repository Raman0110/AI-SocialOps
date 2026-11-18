import type { ColumnsType } from "antd/es/table";
import {
  Badge,
  CopyableId,
  DataTable,
  EmptyState,
  NotAvailable,
  StatusBadge,
  TruncatedText,
} from "../../../shared/ui";
import { AuditOutlined } from "../../../shared/icons";
import type { AgentRun } from "../types/agentRuns";

interface AgentRunsTableProps {
  runs: AgentRun[];
  selectedRunId: string | null;
  onSelect: (runId: string) => void;
}

export function AgentRunsTable({ runs, selectedRunId, onSelect }: AgentRunsTableProps) {
  return (
    <DataTable<AgentRun>
      rows={runs}
      rowId={(run) => run.id}
      selectedId={selectedRunId}
      onSelect={(run) => onSelect(run.id)}
      columns={columns}
      empty={<EmptyState icon={<AuditOutlined />} title="No agent runs match your filters." description="Clear a filter to see more." />}
    />
  );
}

const columns: ColumnsType<AgentRun> = [
  {
    title: "Run",
    dataIndex: "agentName",
    width: 260,
    render: (_value, run) => (
      <div className="max-w-60">
        <span className="block truncate text-[13px] font-medium text-fg">{run.agentName}</span>
        <TruncatedText
          className="text-xs text-fg-muted"
          text={`${run.customerName} · ${run.conversationTopic}`}
        />
      </div>
    ),
  },
  {
    title: "ID",
    dataIndex: "id",
    width: 120,
    render: (id: string) => <CopyableId value={id} />,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: AgentRun["status"]) => <StatusBadge status={status} />,
  },
  {
    title: "Trigger",
    dataIndex: "trigger",
    render: (trigger: AgentRun["trigger"]) => <Badge>{trigger}</Badge>,
  },
  {
    title: "Duration",
    dataIndex: "durationMs",
    align: "right",
    width: 100,
    render: (durationMs: number | null) =>
      durationMs === null ? (
        <NotAvailable label="In progress" />
      ) : (
        <span className="tnum text-[13px] text-fg-secondary">{formatDuration(durationMs)}</span>
      ),
  },
  {
    title: "Started",
    dataIndex: "startedAt",
    align: "right",
    width: 130,
    render: (value: string) => (
      <span className="tnum whitespace-nowrap text-xs text-fg-muted">{formatDateTime(value)}</span>
    ),
  },
];

function formatDuration(durationMs: number) {
  return durationMs < 1000 ? `${durationMs} ms` : `${(durationMs / 1000).toFixed(2)} s`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
