import { Alert, Button, Card, Empty, Skeleton, Space, Tag, Typography } from "antd";
import type { CreateSupportTicketPayload, PendingAgentAction } from "../types/agentActions";

const { Paragraph, Text } = Typography;

interface AgentActionsPanelProps {
  actions: PendingAgentAction[];
  isLoading: boolean;
  error: string | null;
  onApprove: (
    actionId: string
  ) => Promise<void>;
  onReject: (
    actionId: string
  ) => Promise<void>;
}

export function AgentActionsPanel({
  actions,
  isLoading,
  error,
  onApprove,
  onReject,
}: AgentActionsPanelProps) {
  if (isLoading) {
    return (
      <Card className="app-card-shadow" size="small" title="AI Suggested Actions">
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  if (error) {
    return <Alert showIcon type="error" message={error} />;
  }

  if (actions.length === 0) {
    return (
      <Card className="app-card-shadow" size="small" title="AI Suggested Actions">
        <Empty description="No pending actions" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <Card className="app-card-shadow" size="small" title="AI Suggested Actions">
      <Space direction="vertical" className="w-full" size="middle">
        {actions.map((action) => (
          <AgentActionCard
            key={action.id}
            action={action}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </Space>
    </Card>
  );
}

interface AgentActionCardProps {
  action: PendingAgentAction;
  onApprove: (actionId: string) => Promise<void>;
  onReject: (actionId: string) => Promise<void>;
}

function AgentActionCard({
  action,
  onApprove,
  onReject,
}: AgentActionCardProps) {
  if (action.type === "CreateSupportTicket") {
    const payload = JSON.parse(action.payloadJson) as CreateSupportTicketPayload;

    return (
      <Card size="small" className="border-slate-200">
        <Space direction="vertical" className="w-full" size="small">
          <Space className="w-full justify-between" align="start">
            <Text strong>Create support ticket</Text>
            <Tag color={payload.priority === "Urgent" ? "red" : "orange"}>
              {payload.priority}
            </Tag>
          </Space>

          <Text strong>{payload.title}</Text>
          <Paragraph className="mb-0 text-sm text-slate-600">
            {payload.description}
          </Paragraph>

          <Space>
            <Button onClick={() => onReject(action.id)}>Reject</Button>
            <Button type="primary" onClick={() => onApprove(action.id)}>
              Approve
            </Button>
          </Space>
        </Space>
      </Card>
    );
  }

  return <Alert type="warning" message={`Unsupported action: ${action.type}`} />;
}
