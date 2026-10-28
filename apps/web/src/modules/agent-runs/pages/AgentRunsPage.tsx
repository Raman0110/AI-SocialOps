import { useEffect, useMemo, useState } from "react";
import { Alert, Input, Select, Spin, Typography, message } from "antd";
import { getAgentRun, getAgentRuns } from "../../../api/agentRuns";
import { generateAgentReply } from "../../../api/ai";
import { getInbox } from "../../../api/conversations";
import type { InboxConversation } from "../../inbox/types/conversations";
import { AgentRunDetails } from "../components/AgentRunDetails";
import { AgentRunsTable } from "../components/AgentRunsTable";
import type { AgentRun, AgentRunStatus, AgentRunTrigger } from "../types/agentRuns";

const { Text, Title } = Typography;
const organizationId =
  import.meta.env.VITE_ORGANIZATION_ID ?? "00000000-0000-0000-0000-000000000001";

export function AgentRunsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgentRunStatus | "All">("All");
  const [triggerFilter, setTriggerFilter] = useState<AgentRunTrigger | "All">("All");
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
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
        const result = await loadAgentRuns();
        setRuns(result);
        setSelectedRunId(result[0]?.id ?? null);
      } catch {
        setError("Unable to load agent runs.");
      } finally {
        setLoading(false);
      }
    }

    loadRuns();
  }, []);

  async function handleRetry(runId: string) {
    try {
      setIsRetrying(true);
      const run = runs.find((item) => item.id === runId);

      if (!run) {
        throw new Error("Agent run not found.");
      }

      await generateAgentReply(run.conversationId);
      const refreshedRuns = await loadAgentRuns();
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
    return <div className="grid min-h-[60vh] place-items-center"><Spin description="Loading agent runs..." /></div>;
  }

  if (error) {
    return <div className="grid min-h-[60vh] place-items-center"><Alert showIcon type="error" message={error} /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-4 bg-slate-100 p-4">
      {contextHolder}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 app-panel-shadow">
        <div>
          <Title level={4} className="mb-1">Agent execution history</Title>
          <Text type="secondary">{filteredRuns.length} of {runs.length} recorded runs</Text>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
          <Input.Search
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search run, agent, customer, or topic"
            allowClear
          />
          <Select
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
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white app-panel-shadow">
          <AgentRunsTable runs={filteredRuns} selectedRunId={visibleSelectedRunId} onSelect={setSelectedRunId} />
        </section>
        <main className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white app-panel-shadow">
          <AgentRunDetails run={selectedRun} isRetrying={isRetrying} onRetry={handleRetry} />
        </main>
      </div>
    </div>
  );
}

async function loadAgentRuns(): Promise<AgentRun[]> {
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
