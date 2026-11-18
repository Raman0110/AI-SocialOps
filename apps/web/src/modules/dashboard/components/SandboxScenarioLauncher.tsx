import {
  Alert,
  Button,
  Tag,
  Typography,
} from "antd";
import {
  ArrowRightOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import type { SandboxScenario, SandboxScenarioId } from "../types/sandboxScenarios";

const { Text, Title } = Typography;

interface SandboxScenarioLauncherProps {
  scenarios: SandboxScenario[];
  launchingScenarioId: SandboxScenarioId | null;
  createdScenario: SandboxScenario | null;
  error: string | null;
  onLaunch: (scenario: SandboxScenario) => void;
  onOpenInbox: () => void;
}

export function SandboxScenarioLauncher({
  scenarios,
  launchingScenarioId,
  createdScenario,
  error,
  onLaunch,
  onOpenInbox,
}: SandboxScenarioLauncherProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-slate-600">
            <ExperimentOutlined />
            <Text strong className="text-slate-600">Sandbox workflow lab</Text>
          </div>
          <Title level={4} className="mb-1">Launch a customer scenario</Title>
          <Text type="secondary">
            Create a real inbound sandbox message, then inspect how the AI handles it in the inbox.
          </Text>
        </div>
        <Tag color="blue">Safe sandbox</Tag>
      </div>

      {error && (
        <Alert
          className="mt-4"
          type="error"
          showIcon
          message="Scenario could not be created"
          description={error}
        />
      )}

      {createdScenario && (
        <Alert
          className="mt-4"
          type="success"
          showIcon
          message={`${createdScenario.title} is ready`}
          description="The inbound message was stored and the dashboard metrics were refreshed. Open the inbox to run the AI workflow."
          action={(
            <Button size="small" type="primary" onClick={onOpenInbox}>
              Open inbox <ArrowRightOutlined />
            </Button>
          )}
        />
      )}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <article
            key={scenario.id}
            className="flex min-h-56 flex-col rounded-md border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-400 hover:bg-white"
          >
            <div className="flex items-start justify-between gap-2">
              <Title level={5} className="mb-0">{scenario.title}</Title>
              <Tag color={tagColor[scenario.id]}>{scenario.label}</Tag>
            </div>
            <Text type="secondary" className="mt-3 text-sm">
              {scenario.description}
            </Text>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
              <span className="font-semibold text-slate-800">Expected: </span>
              {scenario.expectedOutcome}
            </div>
            <Button
              className="mt-auto"
              icon={<PlayCircleOutlined />}
              loading={launchingScenarioId === scenario.id}
              disabled={launchingScenarioId !== null && launchingScenarioId !== scenario.id}
              onClick={() => onLaunch(scenario)}
            >
              Launch scenario
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

const tagColor: Record<SandboxScenarioId, string> = {
  faq: "green",
  complaint: "orange",
  escalation: "red",
};
