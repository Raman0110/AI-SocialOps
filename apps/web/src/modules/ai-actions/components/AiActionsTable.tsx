import type { ColumnsType } from "antd/es/table";
import { DataTable, EmptyState, NotAvailable, PlatformBadge, RiskBadge, StatusBadge, TruncatedText } from "../../../shared/ui";
import { RobotOutlined } from "../../../shared/icons";
import type { AiAction } from "../types/aiActions";

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
    <DataTable<AiAction>
      rows={actions}
      rowId={(action) => action.id}
      selectedId={selectedActionId}
      onSelect={(action) => onSelect(action.id)}
      columns={columns}
      empty={<EmptyState icon={<RobotOutlined />} title="No AI actions match your filters." description="Clear a filter to see more." />}
    />
  );
}

const columns: ColumnsType<AiAction> = [
  {
    title: "Action",
    dataIndex: "type",
    width: 280,
    render: (_value, action) => (
      <div className="max-w-64">
        <span className="block truncate text-[13px] font-medium text-fg">{action.type}</span>
        <TruncatedText
          className="text-xs text-fg-muted"
          text={`${action.customerName} · ${action.conversationTopic}`}
        />
      </div>
    ),
  },
  {
    title: "Platform",
    dataIndex: "platform",
    render: (platform: AiAction["platform"]) => <PlatformBadge platform={platform} />,
  },
  {
    title: "Risk",
    dataIndex: "risk",
    render: (risk: AiAction["risk"]) => <RiskBadge level={risk} />,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: AiAction["status"]) => <StatusBadge status={status} />,
  },
  {
    title: "Confidence",
    dataIndex: "confidence",
    align: "right",
    width: 110,
    render: (confidence: number | null) =>
      confidence === null ? (
        <NotAvailable label="Not available" />
      ) : (
        <span className="tnum text-[13px] text-fg">{Math.round(confidence * 100)}%</span>
      ),
  },
];
