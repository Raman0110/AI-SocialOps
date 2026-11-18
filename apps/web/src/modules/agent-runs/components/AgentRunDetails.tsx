import {
  ApiOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Descriptions, Empty, Space, Statistic, Tag, Timeline, Typography } from "antd";
import type { AgentRun, AgentRunStepStatus } from "../types/agentRuns";

const { Paragraph, Text, Title } = Typography;

interface AgentRunDetailsProps {
  run: AgentRun | null;
  isRetrying: boolean;
  onRetry: (runId: string) => Promise<void>;
}

export function AgentRunDetails({ run, isRetrying, onRetry }: AgentRunDetailsProps) {
  if (!run) {
    return (
      <div className="grid h-full place-items-center p-8">
        <Empty description="Select an agent run to inspect its execution." />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Space wrap className="mb-2">
              <Title level={3} className="mb-0">{run.agentName}</Title>
              <Tag color={statusColors[run.status]}>{run.status}</Tag>
              <Tag>{run.trigger}</Tag>
            </Space>
            <Text type="secondary" className="block">
              {run.customerName} · {run.conversationTopic}
            </Text>
            <Text code className="mt-2 inline-block">{run.id}</Text>
          </div>

          <Button
            icon={<ReloadOutlined />}
            loading={isRetrying}
            disabled={run.status === "Running"}
            onClick={() => onRetry(run.id)}
          >
            Retry run
          </Button>
        </div>

        {run.errorMessage && (
          <Alert
            className="mt-4"
            type="error"
            showIcon
            title="Run failed"
            description={run.errorMessage}
          />
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Card size="small" className="">
            <Statistic title="Duration" value={formatDuration(run.durationMs)} />
          </Card>
          <Card size="small" className="">
            <Statistic title="Prompt tokens" value={run.promptTokens ?? "Not provided"} />
          </Card>
          <Card size="small" className="">
            <Statistic title="Output tokens" value={run.completionTokens ?? "Not provided"} />
          </Card>
          <Card size="small" className="">
            <Statistic title="Tools called" value={run.toolsUsed.length} />
          </Card>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-4">
          <Card title="Execution summary" className="">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Model"><Text code>{run.model}</Text></Descriptions.Item>
              <Descriptions.Item label="Platform"><Tag>{run.platform}</Tag></Descriptions.Item>
              <Descriptions.Item label="Started">{formatDateTime(run.startedAt)}</Descriptions.Item>
              <Descriptions.Item label="Completed">
                {run.completedAt ? formatDateTime(run.completedAt) : "Still running"}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-4 space-y-3">
              <SummaryBlock title="Input" content={run.inputSummary} />
              <SummaryBlock title="Output" content={run.outputSummary ?? "No output produced yet."} />
            </div>
          </Card>

          <Card title="Tools used" className="">
            <Space wrap>
              {run.toolsUsed.map((tool) => (
                <Tag key={tool} icon={<ApiOutlined />}>{tool}</Tag>
              ))}
            </Space>
          </Card>
        </section>

        <Card title="Execution timeline" className="">
          {run.steps.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Waiting for execution steps." />
          ) : (
            <Timeline
              items={run.steps.map((step) => ({
                color: stepColors[step.status],
                content: (
                  <div className="pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <Text strong>{step.name}</Text>
                      <Tag color={stepTagColors[step.status]}>{step.status}</Tag>
                    </div>
                    <Paragraph className="mb-1 mt-1 text-sm text-slate-600">{step.detail}</Paragraph>
                    <Text type="secondary" className="text-xs">
                      <ClockCircleOutlined /> {formatDuration(step.durationMs)}
                    </Text>
                  </div>
                ),
              }))}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

function SummaryBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <Text type="secondary" className="block text-xs uppercase tracking-wide">
        <CodeOutlined /> {title}
      </Text>
      <Text className="mt-1 block text-sm text-slate-700">{content}</Text>
    </div>
  );
}

function formatDuration(durationMs: number | null) {
  if (durationMs === null) return "In progress";
  return durationMs < 1000 ? `${durationMs} ms` : `${(durationMs / 1000).toFixed(2)} s`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

const statusColors: Record<AgentRun["status"], string> = {
  Running: "processing",
  Completed: "success",
  Failed: "error",
};

const stepColors: Record<AgentRunStepStatus, string> = {
  Completed: "green",
  Failed: "red",
  Skipped: "gray",
};

const stepTagColors: Record<AgentRunStepStatus, string> = {
  Completed: "success",
  Failed: "error",
  Skipped: "default",
};
