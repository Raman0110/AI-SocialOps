import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  CodeOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Button, Card, Descriptions, Empty, Space, Tag, Typography } from "antd";
import type { AiAction } from "../types/aiActions";

const { Paragraph, Text, Title } = Typography;

interface AiActionDetailsProps {
  action: AiAction | null;
  onApprove: (actionId: string) => Promise<void>;
  onReject: (actionId: string) => Promise<void>;
  isResolving: boolean;
}

export function AiActionDetails({
  action,
  onApprove,
  onReject,
  isResolving,
}: AiActionDetailsProps) {
  if (!action) {
    return (
      <div className="grid h-full place-items-center p-8">
        <Empty description="Select an AI action to review." />
      </div>
    );
  }

  const canResolve = action.status === "Pending";

  return (
    <div className="h-full overflow-y-auto p-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 app-panel-shadow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Space wrap className="mb-2">
              <Title level={3} className="mb-0">
                {action.type}
              </Title>
              <Tag color={riskColors[action.risk]}>{action.risk} risk</Tag>
              <Tag color={statusColors[action.status]}>{action.status}</Tag>
            </Space>
            <Text type="secondary" className="block">
              {action.customerName} · {action.conversationTopic}
            </Text>
          </div>

          <Space wrap>
            <Button
              icon={<CloseOutlined />}
              disabled={!canResolve}
              loading={isResolving}
              onClick={() => onReject(action.id)}
            >
              Reject
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              disabled={!canResolve}
              loading={isResolving}
              onClick={() => onApprove(action.id)}
            >
              Approve
            </Button>
          </Space>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card size="small" className="app-card-shadow">
            <Text type="secondary" className="block text-xs">
              Confidence
            </Text>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {action.confidence === null
                ? "Not provided"
                : `${Math.round(action.confidence * 100)}%`}
            </div>
          </Card>
          <Card size="small" className="app-card-shadow">
            <Text type="secondary" className="block text-xs">
              Platform
            </Text>
            <Tag color={platformColors[action.platform]} className="mt-2">
              {action.platform}
            </Tag>
          </Card>
          <Card size="small" className="app-card-shadow">
            <Text type="secondary" className="block text-xs">
              Created
            </Text>
            <div className="mt-2 text-sm font-semibold text-slate-800">
              <ClockCircleOutlined /> {formatDateTime(action.createdAt)}
            </div>
          </Card>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card title="AI reasoning" className="app-card-shadow">
          <Paragraph className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <RobotOutlined /> {action.reasoning}
          </Paragraph>
          <Descriptions column={1} size="small" className="mt-4">
            <Descriptions.Item label="Tools used">
              <Space wrap>
                {action.toolsUsed.map((tool) => (
                  <Tag key={tool} icon={<CodeOutlined />}>
                    {tool}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Proposed payload" className="app-card-shadow">
          <div className="space-y-3">
            {Object.entries(action.payload).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Text type="secondary" className="block text-xs uppercase tracking-wide">
                  {formatLabel(key)}
                </Text>
                <Text className="mt-1 block text-sm text-slate-800">
                  {Array.isArray(value) ? value.join(", ") : value}
                </Text>
              </div>
            ))}
          </div>
        </Card>
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
