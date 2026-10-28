import { Progress, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { AiAction } from "../types/aiActions";

const { Text } = Typography;

interface AiActionsTableProps {
  actions: AiAction[];
  selectedActionId: string | null;
  onSelect: (actionId: string) => void;
}

export function AiActionsTable({
  actions,
  selectedActionId,
  onSelect,
}: AiActionsTableProps) {
  return (
    <Table
      rowKey="id"
      size="middle"
      pagination={false}
      dataSource={actions}
      columns={columns}
      rowClassName={(action) =>
        action.id === selectedActionId ? "cursor-pointer bg-blue-50" : "cursor-pointer"
      }
      onRow={(action) => ({
        onClick: () => onSelect(action.id),
      })}
      locale={{ emptyText: "No AI actions match your filters." }}
    />
  );
}

const columns: ColumnsType<AiAction> = [
  {
    title: "Action",
    dataIndex: "type",
    render: (_value, action) => (
      <div>
        <Text strong>{action.type}</Text>
        <Text type="secondary" className="block text-xs">
          {action.customerName} · {action.conversationTopic}
        </Text>
      </div>
    ),
  },
  {
    title: "Platform",
    dataIndex: "platform",
    render: (platform: AiAction["platform"]) => (
      <Tag color={platformColors[platform]}>{platform}</Tag>
    ),
  },
  {
    title: "Risk",
    dataIndex: "risk",
    render: (risk: AiAction["risk"]) => <Tag color={riskColors[risk]}>{risk}</Tag>,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: AiAction["status"]) => (
      <Tag color={statusColors[status]}>{status}</Tag>
    ),
  },
  {
    title: "Confidence",
    dataIndex: "confidence",
    width: 140,
    render: (confidence: number | null) =>
      confidence === null ? (
        <Text type="secondary">Not provided</Text>
      ) : (
        <Progress
          percent={Math.round(confidence * 100)}
          size="small"
          status={confidence >= 0.85 ? "success" : "normal"}
        />
      ),
  },
];

const platformColors: Record<AiAction["platform"], string> = {
  Instagram: "magenta",
  Facebook: "blue",
  X: "default",
  TikTok: "purple",
  WhatsApp: "green",
};

const riskColors: Record<AiAction["risk"], string> = {
  Low: "success",
  Medium: "warning",
  High: "error",
};

const statusColors: Record<AiAction["status"], string> = {
  Pending: "processing",
  Approved: "success",
  Rejected: "error",
};
