import type { CreateSupportTicketPayload, PendingAgentAction } from "../../types/agentActions";

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
      <div style={{ padding: "16px 24px" }}>
        Loading pending actions...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px 24px" }}>
        {error}
      </div>
    );
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        padding: "16px 24px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <strong>
        AI Suggested Actions
      </strong>

      {actions.map((action) => (
        <AgentActionCard
          key={action.id}
          action={action}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </section>
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
      <div
        style={{
          marginTop: "12px",
          padding: "16px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <div>
          <strong>
            Create support ticket
          </strong>
        </div>

        <p>
          <strong>Title:</strong>{" "}
          {payload.title}
        </p>

        <p>
          <strong>Priority:</strong>{" "}
          {payload.priority}
        </p>

        <p>
          <strong>Description:</strong>{" "}
          {payload.description}
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            onClick={() =>
              onReject(action.id)
            }
          >
            Reject
          </button>

          <button
            onClick={() =>
              onApprove(action.id)
            }
          >
            Approve
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      Unsupported action:
      {" "}
      {action.type}
    </div>
  );
}