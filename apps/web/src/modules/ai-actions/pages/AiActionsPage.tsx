import { useEffect, useMemo, useState } from "react";
import { Alert, Input, Select, message } from "antd";
import { SkeletonRows } from "../../../shared/ui";
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

export function AiActionsPage({ organizationId }: { organizationId: string }) {
  const [actions, setActions] = useState<AiAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AiActionType | "All">("All");
  const [riskFilter, setRiskFilter] = useState<AiActionRisk | "All">("All");
  const [statusFilter, setStatusFilter] = useState<AiActionStatus | "All">("Pending");
  const [loading, setLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  // Below xl the detail pane is a slide-over; this only controls its visibility.
  const [detailOpen, setDetailOpen] = useState(false);
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
      <div className="overflow-hidden rounded-lg border border-line bg-surface" aria-busy="true">
        <span className="sr-only">Loading AI actions...</span>
        <SkeletonRows rows={6} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <Alert showIcon type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col gap-4 sm:h-[calc(100vh-104px)]">
      {contextHolder}

      <section className="shrink-0 rounded-lg border border-line bg-surface px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div>
            <h2 className="m-0 text-sm font-semibold text-fg">AI approval queue</h2>
            <p className="tnum m-0 text-xs text-fg-muted">
              {filteredActions.length} of {actions.length} generated actions
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <Input.Search
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search customer, topic, or action"
              allowClear
              className="sm:w-72"
            />
            <Select
              aria-label="Filter by action type"
              className="sm:w-44"
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
              aria-label="Filter by risk"
              className="sm:w-32"
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
              aria-label="Filter by status"
              className="sm:w-32"
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
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="min-h-0 min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
          <AiActionsTable
            actions={filteredActions}
            selectedActionId={visibleSelectedActionId}
            onSelect={(actionId) => {
              setSelectedActionId(actionId);
              setDetailOpen(true);
            }}
          />
        </section>

        <main
          className={`min-h-0 min-w-0 overflow-hidden bg-surface xl:static xl:z-auto xl:block xl:rounded-lg xl:border xl:border-line ${
            detailOpen ? "fixed inset-0 z-40 block" : "hidden"
          }`}
        >
          <AiActionDetails
            action={selectedAction}
            isResolving={isResolving}
            onApprove={(actionId) => handleResolveAction(actionId, "Approved")}
            onReject={(actionId) => handleResolveAction(actionId, "Rejected")}
            onClose={() => setDetailOpen(false)}
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
