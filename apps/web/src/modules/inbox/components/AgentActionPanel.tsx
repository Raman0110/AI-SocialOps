import { Alert, Button } from "antd";
import { BulbOutlined, CheckOutlined } from "../../../shared/icons";
import { Badge, EmptyState, SkeletonRows } from "../../../shared/ui";
import { ShieldAlertIcon } from "../../../shared/icons";
import type { CreateSupportTicketPayload, PendingAgentAction } from "../types/agentActions";

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
    return <SkeletonRows rows={2} columns={2} />;
  }

  if (error) {
    return <Alert showIcon type="error" message={error} />;
  }

  if (actions.length === 0) {
    return <EmptyState icon={<BulbOutlined />} title="No pending actions" description="Suggested actions from the AI appear here for review." />;
  }

  return (
    <div className="-mx-4 border-t border-line">
      {actions.map((action) => (
        <AgentActionCard
          key={action.id}
          action={action}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
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
    const urgent = payload.priority === "Urgent";

    return (
      <article className="border-b border-line px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <span className="eyebrow">Create support ticket</span>
          {urgent ? (
            <Badge tone="danger" icon={<ShieldAlertIcon />}>{payload.priority}</Badge>
          ) : (
            <Badge>{payload.priority}</Badge>
          )}
        </div>

        <h3 className="m-0 mt-2 text-[13px] font-semibold leading-5 text-fg">{payload.title}</h3>
        <p className="m-0 mt-1 text-[13px] leading-5 text-fg-secondary">{payload.description}</p>

        <div className="mt-3 flex items-center gap-2">
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => onApprove(action.id)}>
            Approve
          </Button>
          <Button size="small" onClick={() => onReject(action.id)}>
            Reject
          </Button>
        </div>
      </article>
    );
  }

  return <Alert type="warning" message={`Unsupported action: ${action.type}`} />;
}
