import { useEffect, useMemo, useState } from "react";
import { Alert, Input, Select, message } from "antd";
import { SkeletonRows } from "../../../shared/ui";
import { getAgentRun, getAgentRuns } from "../../../api/agentRuns";
import { generateAgentReply } from "../../../api/ai";
import { getInbox } from "../../../api/conversations";
import type { InboxConversation } from "../../inbox/types/conversations";
import { AgentRunDetails } from "../components/AgentRunDetails";
import { AgentRunsTable } from "../components/AgentRunsTable";
import type { AgentRun, AgentRunStatus, AgentRunTrigger } from "../types/agentRuns";

export function AgentRunsPage({ organizationId }: { organizationId: string }) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgentRunStatus | "All">("All");
  const [triggerFilter, setTriggerFilter] = useState<AgentRunTrigger | "All">("All");
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  // Below xl the detail pane is a slide-over; this only controls its visibility.
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const filteredRuns = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const searchTokens = search.split(/\s+/).filter(Boolean);

    return runs.filter((run) => {
      const searchableText = [
        run.id,
        run.agentName,
        run.customerName,
        run.conversationTopic,
        run.platform,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchTokens.every((token) => searchableText.includes(token));
      const matchesStatus = statusFilter === "All" || run.status === statusFilter;
      const matchesTrigger = triggerFilter === "All" || run.trigger === triggerFilter;

      return matchesSearch && matchesStatus && matchesTrigger;
    });
  }, [runs, searchTerm, statusFilter, triggerFilter]);

  const visibleSelectedRunId = useMemo(() => {
    if (selectedRunId && filteredRuns.some((run) => run.id === selectedRunId)) {
      return selectedRunId;
    }
    return filteredRuns[0]?.id ?? null;
  }, [filteredRuns, selectedRunId]);

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === visibleSelectedRunId) ?? null,
    [runs, visibleSelectedRunId],
  );

  useEffect(() => {
    async function loadRuns() {
      try {
        setLoading(true);
        const result = await loadAgentRuns(organizationId);
        setRuns(result);
        setSelectedRunId(result[0]?.id ?? null);
      } catch {
        setError("Unable to load agent runs.");
      } finally {
        setLoading(false);
      }
    }

    loadRuns();
  }, [organizationId]);

  async function handleRetry(runId: string) {
    try {
      setIsRetrying(true);
      const run = runs.find((item) => item.id === runId);

      if (!run) {
        throw new Error("Agent run not found.");
      }

      await generateAgentReply(run.conversationId);
      const refreshedRuns = await loadAgentRuns(organizationId);
      setRuns(refreshedRuns);
      setSelectedRunId(
        refreshedRuns.find((item) => item.conversationId === run.conversationId)?.id ?? null,
      );
      setStatusFilter("All");
      setTriggerFilter("All");
      messageApi.success("Agent run completed and history refreshed.");
    } catch {
      messageApi.error("Unable to retry agent run.");
    } finally {
      setIsRetrying(false);
    }
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-line bg-surface" aria-busy="true">
        <span className="sr-only">Loading agent runs...</span>
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
            <h2 className="m-0 text-sm font-semibold text-fg">Agent execution history</h2>
            <p className="tnum m-0 text-xs text-fg-muted">
              {filteredRuns.length} of {runs.length} recorded runs
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <Input.Search
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search run, agent, customer, or topic"
              allowClear
              className="sm:w-72"
            />
            <Select
              aria-label="Filter by status"
              className="sm:w-36"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "All", label: "All statuses" },
                { value: "Running", label: "Running" },
                { value: "Completed", label: "Completed" },
                { value: "Failed", label: "Failed" },
              ]}
            />
            <Select
              aria-label="Filter by trigger"
              className="sm:w-36"
              value={triggerFilter}
              onChange={setTriggerFilter}
              options={[
                { value: "All", label: "All triggers" },
                { value: "Webhook", label: "Webhook" },
                { value: "Manual", label: "Manual" },
                { value: "Scheduled", label: "Scheduled" },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="min-h-0 min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
          <AgentRunsTable
            runs={filteredRuns}
            selectedRunId={visibleSelectedRunId}
            onSelect={(runId) => {
              setSelectedRunId(runId);
              setDetailOpen(true);
            }}
          />
        </section>
        <main
          className={`min-h-0 min-w-0 overflow-hidden bg-surface xl:static xl:z-auto xl:block xl:rounded-lg xl:border xl:border-line ${
            detailOpen ? "fixed inset-0 z-40 block" : "hidden"
          }`}
        >
          <AgentRunDetails
            run={selectedRun}
            isRetrying={isRetrying}
            onRetry={handleRetry}
            onClose={() => setDetailOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}

async function loadAgentRuns(organizationId: string): Promise<AgentRun[]> {
  const conversations = await getInbox(organizationId);
  const runsByConversation = await Promise.all(
    conversations.map(async (conversation) => {
      const summaries = await getAgentRuns(conversation.id, organizationId);

      return Promise.all(
        summaries.map(async (summary) => {
          const detail = await getAgentRun(summary.id, organizationId);
          return mapAgentRun(conversation, detail);
        }),
      );
    }),
  );

  return runsByConversation
    .flat()
    .sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt));
}

function mapAgentRun(
  conversation: InboxConversation,
  detail: Awaited<ReturnType<typeof getAgentRun>>,
): AgentRun {
  return {
    id: detail.id,
    conversationId: detail.conversationId,
    agentName: "Conversation Agent",
    status: detail.status,
    trigger: "Manual",
    platform: conversation.platform,
    customerName: conversation.customerName,
    conversationTopic: conversation.lastMessage ?? "Conversation agent request",
    startedAt: detail.startedAt,
    completedAt: detail.completedAt,
    durationMs: detail.durationMilliseconds,
    inputSummary: conversation.lastMessage ?? `Input message ${detail.inputMessageId}`,
    outputSummary: detail.finalReply,
    model: detail.model ?? "Not provided",
    toolsUsed: [...new Set(detail.toolExecutions.map((execution) => execution.toolName))],
    promptTokens: null,
    completionTokens: null,
    errorMessage: detail.error,
    steps: detail.toolExecutions.map((execution) => ({
      id: execution.id,
      name: execution.toolName,
      status: execution.success ? "Completed" : "Failed",
      durationMs: execution.durationMilliseconds ?? 0,
      detail:
        execution.error ??
        execution.resultJson ??
        `Arguments: ${execution.argumentsJson}`,
    })),
  };
}
