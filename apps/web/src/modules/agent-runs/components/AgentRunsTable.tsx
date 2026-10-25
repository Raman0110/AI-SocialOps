import { ClockCircleOutlined } from "@ant-design/icons";
import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { AgentRun } from "../types/agentRuns";

const { Text } = Typography;

interface AgentRunsTableProps {
  runs: AgentRun[];
  selectedRunId: string | null;
  onSelect: (runId: string) => void;
}

export function AgentRunsTable({ runs, selectedRunId, onSelect }: AgentRunsTableProps) {
  return (
    <Table
      rowKey="id"
      size="middle"
      pagination={false}
      dataSource={runs}
      columns={columns}
      rowClassName={(run) =>
        run.id === selectedRunId ? "cursor-pointer bg-blue-50" : "cursor-pointer"
      }
      onRow={(run) => ({ onClick: () => onSelect(run.id) })}
      locale={{ emptyText: "No agent runs match your filters." }}
    />
  );
}

const columns: ColumnsType<AgentRun> = [
  {
    title: "Run",
    dataIndex: "agentName",
    render: (_value, run) => (
      <div>
        <Text strong>{run.agentName}</Text>
        <Text type="secondary" className="block max-w-64 truncate text-xs">
          {run.customerName} · {run.conversationTopic}
        </Text>
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: AgentRun["status"]) => (
      <Tag color={statusColors[status]}>{status}</Tag>
    ),
  },
  {
    title: "Trigger",
    dataIndex: "trigger",
    render: (trigger: AgentRun["trigger"]) => <Tag>{trigger}</Tag>,
  },
  {
    title: "Duration",
    dataIndex: "durationMs",
    render: (durationMs: number | null) => (
      <Text type="secondary">
        <ClockCircleOutlined /> {durationMs === null ? "In progress" : formatDuration(durationMs)}
      </Text>
    ),
  },
  {
    title: "Started",
    dataIndex: "startedAt",
    render: (value: string) => <Text type="secondary">{formatDateTime(value)}</Text>,
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

const statusColors: Record<AgentRun["status"], string> = {
  Running: "processing",
  Completed: "success",
  Failed: "error",
};
