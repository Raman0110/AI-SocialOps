import { Alert, Button } from "antd";
import { ArrowRightOutlined, ExperimentOutlined, PlayCircleOutlined } from "../../../shared/icons";
import { Badge, Panel, PanelHeader } from "../../../shared/ui";
import type { Tone } from "../../../shared/ui";
import { ShieldAlertIcon, ShieldCheckIcon } from "../../../shared/icons";
import type { SandboxScenario, SandboxScenarioId } from "../types/sandboxScenarios";

interface SandboxScenarioLauncherProps {
  scenarios: SandboxScenario[];
  launchingScenarioId: SandboxScenarioId | null;
  createdScenario: SandboxScenario | null;
  error: string | null;
  onLaunch: (scenario: SandboxScenario) => void;
  onOpenInbox: () => void;
}

const risk: Record<SandboxScenarioId, { tone: Tone; high: boolean }> = {
  faq: { tone: "success", high: false },
  complaint: { tone: "warning", high: true },
  escalation: { tone: "danger", high: true },
};

/**
 * One panel; scenarios are rows split by hairlines (no card-in-card).
 * Each row stays an <article> so it can be targeted as a unit.
 */
export function SandboxScenarioLauncher({
  scenarios,
  launchingScenarioId,
  createdScenario,
  error,
  onLaunch,
  onOpenInbox,
}: SandboxScenarioLauncherProps) {
  return (
    <Panel aria-labelledby="sandbox-heading">
      <PanelHeader
        id="sandbox-heading"
        title={
          <span className="flex items-center gap-2">
            <ExperimentOutlined /> Sandbox workflow lab
          </span>
        }
        description="Create a real inbound sandbox message, then inspect how the AI handles it in the inbox."
        actions={<Badge>Safe sandbox</Badge>}
      />

      {(error || createdScenario) && (
        <div className="space-y-2 border-t border-line px-5 py-3">
          {error && (
            <Alert type="error" showIcon message="Scenario could not be created" description={error} />
          )}
          {createdScenario && (
            <Alert
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
        </div>
      )}

      <div>
        {scenarios.map((scenario) => (
          <article
            key={scenario.id}
            className="grid items-center gap-x-6 gap-y-2 border-t border-line px-5 py-3 transition-colors duration-150 hover:bg-surface-hover md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="m-0 text-[13px] font-semibold text-fg">{scenario.title}</h3>
                <Badge
                  tone={risk[scenario.id].tone}
                  icon={risk[scenario.id].high ? <ShieldAlertIcon /> : <ShieldCheckIcon />}
                >
                  {scenario.label}
                </Badge>
              </div>
              <p className="m-0 mt-0.5 text-xs leading-5 text-fg-muted">{scenario.description}</p>
            </div>
            <p className="m-0 text-xs leading-5 text-fg-muted">
              <span className="font-medium text-fg-secondary">Expected: </span>
              {scenario.expectedOutcome}
            </p>
            <Button
              size="small"
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
    </Panel>
  );
}
