import { useEffect, useMemo, useState } from "react";
import { Alert, Input, Select, Spin, Typography, message } from "antd";
import {
  approveAgentAction,
  getPendingAgentActions,
  rejectAgentAction,
} from "../../../api/agentActions";
import { getInbox } from "../../../api/conversations";
import type { PendingAgentAction } from "../../inbox/types/agentActions";
import type { InboxConversation } from "../../inbox/types/conversations";
import { AiActionDetails } from "../components/AiActionDetails";
import { AiActionsTable } from "../components/AiActionsTable";
import type { AiAction, AiActionRisk, AiActionStatus, AiActionType } from "../types/aiActions";

const { Text, Title } = Typography;

export function AiActionsPage({ organizationId }: { organizationId: string }) {
  const [actions, setActions] = useState<AiAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AiActionType | "All">("All");
  const [riskFilter, setRiskFilter] = useState<AiActionRisk | "All">("All");
  const [statusFilter, setStatusFilter] = useState<AiActionStatus | "All">("Pending");
  const [loading, setLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const filteredActions = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return actions.filter((action) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        action.customerName.toLowerCase().includes(normalizedSearchTerm) ||
        action.conversationTopic.toLowerCase().includes(normalizedSearchTerm) ||
        action.type.toLowerCase().includes(normalizedSearchTerm);
      const matchesType = typeFilter === "All" || action.type === typeFilter;
      const matchesRisk = riskFilter === "All" || action.risk === riskFilter;
      const matchesStatus = statusFilter === "All" || action.status === statusFilter;

      return matchesSearch && matchesType && matchesRisk && matchesStatus;
    });
  }, [actions, riskFilter, searchTerm, statusFilter, typeFilter]);

  const visibleSelectedActionId = useMemo(() => {
    if (
      selectedActionId &&
      filteredActions.some((action) => action.id === selectedActionId)
    ) {
      return selectedActionId;
    }

    return filteredActions[0]?.id ?? null;
  }, [filteredActions, selectedActionId]);

  const selectedAction = useMemo(
    () => actions.find((action) => action.id === visibleSelectedActionId) ?? null,
    [actions, visibleSelectedActionId],
  );

  useEffect(() => {
    async function loadAiActions() {
      try {
        setLoading(true);
        const result = await fetchAiActions(organizationId);
        setActions(result);
        setSelectedActionId(result.find((action) => action.status === "Pending")?.id ?? result[0]?.id ?? null);
      } catch {
        setError("Unable to load AI actions.");
      } finally {
        setLoading(false);
      }
    }

    loadAiActions();
  }, [organizationId]);

  async function handleResolveAction(
    actionId: string,
    status: Extract<AiActionStatus, "Approved" | "Rejected">,
  ) {
    try {
      setIsResolving(true);
      if (status === "Approved") {
        await approveAgentAction(actionId);
      } else {
        await rejectAgentAction(actionId);
      }

      setActions((current) =>
        current.map((action) =>
          action.id === actionId ? { ...action, status } : action,
        ),
      );
      setStatusFilter("All");
      setSelectedActionId(actionId);
      messageApi.success(`AI action ${status.toLowerCase()}.`);
    } catch {
      messageApi.error("Unable to update AI action.");
    } finally {
      setIsResolving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spin description="Loading AI actions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Alert showIcon type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-4 bg-slate-100 p-4">
      {contextHolder}

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div>
          <Title level={4} className="mb-1">
            AI approval queue
          </Title>
          <Text type="secondary">
            {filteredActions.length} of {actions.length} generated actions
          </Text>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_200px_160px_160px]">
          <Input.Search
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search customer, topic, or action"
            allowClear
          />

          <Select
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            options={[
              { value: "All", label: "All action types" },
              { value: "Suggested reply", label: "Suggested reply" },
              { value: "Create support ticket", label: "Create support ticket" },
              { value: "Escalate conversation", label: "Escalate conversation" },
              { value: "Add customer tag", label: "Add customer tag" },
            ]}
          />

          <Select
            value={riskFilter}
            onChange={(value) => setRiskFilter(value)}
            options={[
              { value: "All", label: "All risks" },
              { value: "Low", label: "Low" },
              { value: "Medium", label: "Medium" },
              { value: "High", label: "High" },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "All", label: "All statuses" },
              { value: "Pending", label: "Pending" },
              { value: "Approved", label: "Approved" },
              { value: "Rejected", label: "Rejected" },
            ]}
          />
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <AiActionsTable
            actions={filteredActions}
            selectedActionId={visibleSelectedActionId}
            onSelect={setSelectedActionId}
          />
        </section>

        <main className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <AiActionDetails
            action={selectedAction}
            isResolving={isResolving}
            onApprove={(actionId) => handleResolveAction(actionId, "Approved")}
            onReject={(actionId) => handleResolveAction(actionId, "Rejected")}
          />
        </main>
      </div>
    </div>
  );
}

async function fetchAiActions(organizationId: string): Promise<AiAction[]> {
  const conversations = await getInbox(organizationId);
  const actionsByConversation = await Promise.all(
    conversations.map(async (conversation) => {
      const actions = await getPendingAgentActions(conversation.id);
      return actions.map((action) => mapAiAction(action, conversation));
    }),
  );

  return actionsByConversation
    .flat()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

function mapAiAction(
  action: PendingAgentAction,
  conversation: InboxConversation,
): AiAction {
  const payload = parsePayload(action.payloadJson);

  return {
    id: action.id,
    type: mapActionType(action.type),
    status: "Pending",
    risk: riskFromPriority(payload.priority),
    confidence: null,
    customerName: conversation.customerName,
    conversationTopic: conversation.lastMessage ?? "Conversation follow-up",
    platform: conversation.platform,
    createdAt: action.createdAt,
    reasoning: "This action was proposed by the conversation agent and requires human approval.",
    payload,
    toolsUsed: [],
  };
}

function parsePayload(payloadJson: string): Record<string, string | string[]> {
  try {
    const parsed: unknown = JSON.parse(payloadJson);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { value: String(parsed) };
    }

    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.map(String) : String(value ?? ""),
      ]),
    );
  } catch {
    return { rawPayload: payloadJson };
  }
}

function mapActionType(type: string): AiActionType {
  switch (type) {
    case "CreateSupportTicket":
      return "Create support ticket";
    default:
      return "Create support ticket";
  }
}

function riskFromPriority(priority: string | string[] | undefined): AiActionRisk {
  const normalized = Array.isArray(priority) ? priority[0]?.toLowerCase() : priority?.toLowerCase();

  if (normalized === "urgent" || normalized === "high") return "High";
  if (normalized === "normal") return "Medium";
  return "Low";
}
