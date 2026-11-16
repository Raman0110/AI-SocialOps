import { getInbox } from "../../../api/conversations";
import {
  launchSandboxScenario,
  type InboundWebhookResult,
} from "../../../api/webhooks";
import { runtimeConfig } from "../../../shared/config/runtime";
import {
  getMockInbox,
  launchMockSandboxScenario,
} from "../../inbox/mocks/socialopsMock";
import type { InboxConversation } from "../../inbox/types/conversations";
import type { SandboxScenario } from "../types/sandboxScenarios";

export interface DashboardDataSource {
  mode: "api" | "mock";
  getInbox: (organizationId: string) => Promise<InboxConversation[]>;
  launchScenario: (scenario: SandboxScenario) => Promise<InboundWebhookResult>;
}

export const apiDashboardDataSource: DashboardDataSource = {
  mode: "api",
  getInbox,
  launchScenario: launchSandboxScenario,
};

export const mockDashboardDataSource: DashboardDataSource = {
  mode: "mock",
  getInbox: () => getMockInbox(),
  launchScenario: launchMockSandboxScenario,
};

export const defaultDashboardDataSource = runtimeConfig.useMocks
  ? mockDashboardDataSource
  : apiDashboardDataSource;
