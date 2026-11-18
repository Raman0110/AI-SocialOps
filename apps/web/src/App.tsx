import { useState } from "react";
import { AgentRunsPage } from "./modules/agent-runs/pages/AgentRunsPage";
import { AiActionsPage } from "./modules/ai-actions/pages/AiActionsPage";
import { CustomersPage } from "./modules/customers/pages/CustomersPage";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage";
import { KnowledgePage } from "./modules/knowledge/pages/KnowledgePage";
import { InboxPage } from "./modules/inbox/pages/InboxPage";
import { SocialAccountsPage } from "./modules/social-accounts/pages/SocialAccountsPage";
import { AppLayout } from "./shared/layout";
import type { NavKey } from "./shared/layout/AppLayout";
import { runtimeConfig } from "./shared/config/runtime";
import { useAuth } from "./modules/auth/context/useAuth";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { WorkspaceModal } from "./modules/auth/components/WorkspaceModal";
import { OrganizationSettingsPage } from "./modules/settings/pages/OrganizationSettingsPage";

function App() {
  const [activeKey, setActiveKey] = useState<NavKey>("dashboard");
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const { session, login, logout, switchOrganization, createOrganization } = useAuth();
  const organizationId = session?.organization.id ?? "";
  const canManageOrganization =
    session?.organization.role === "Owner" || session?.organization.role === "Admin";

  const pageMeta: Record<string, { title: string; description?: string }> = {
    dashboard: {
      title: "Dashboard",
      description: "Customer support performance at a glance",
    },
    inbox: {
      title: "Inbox",
    },
    customers: {
      title: "Customers",
      description: "Customer profiles, social identities, and activity history",
    },
    "social-accounts": {
      title: "Social Accounts",
      description: "Connected organization accounts and webhook health",
    },
    "ai-actions": {
      title: "AI Actions",
      description: "Review generated actions before they touch customers or operations",
    },
    "agent-runs": {
      title: "Agent Runs",
      description: "Inspect AI execution history, tool calls, latency, and failures",
    },
    knowledge: {
      title: "Knowledge",
      description: "FAQs and policies the AI agent answers customers from",
    },
    settings: {
      title: "Organization Settings",
      description: "Manage workspace members and role-based access",
    },
  };
  const currentPageMeta = pageMeta[activeKey] ?? pageMeta.dashboard;

  return (
    <>
      {!session ? (
        <LoginPage onLogin={login} />
      ) : (
      <>
        <AppLayout
        activeKey={activeKey}
        tenant={{
          name: session.organization.name,
          badge: runtimeConfig.useMocks ? "Mock" : session.organization.role,
        }}
        user={{ name: session.user.name, role: `${session.organization.role} access` }}
        pageTitle={currentPageMeta.title}
        pageDescription={currentPageMeta.description}
        isMockData={runtimeConfig.useMocks}
        canManageOrganization={canManageOrganization}
        onSwitchWorkspace={() => setWorkspaceModalOpen(true)}
        onLogout={logout}
        onNavigate={(key) => {
          if (
            key === "dashboard" ||
            key === "inbox" ||
            key === "customers" ||
            key === "ai-actions" ||
            key === "agent-runs" ||
            key === "knowledge" ||
            key === "social-accounts" ||
            key === "settings"
          ) {
            setActiveKey(key);
          }
        }}
      >
        {activeKey === "dashboard" ? (
          <DashboardPage
            organizationId={organizationId}
            onOpenInbox={() => setActiveKey("inbox")}
            onOpenAiActions={() => setActiveKey("ai-actions")}
          />
        ) : activeKey === "customers" ? (
          <CustomersPage onOpenInbox={() => setActiveKey("inbox")} />
        ) : activeKey === "social-accounts" ? (
          <SocialAccountsPage />
        ) : activeKey === "ai-actions" ? (
          <AiActionsPage organizationId={organizationId} />
        ) : activeKey === "agent-runs" ? (
          <AgentRunsPage organizationId={organizationId} />
        ) : activeKey === "knowledge" ? (
          <KnowledgePage />
        ) : activeKey === "settings" ? (
          <OrganizationSettingsPage
            currentUserId={session.user.id}
            currentRole={session.organization.role}
            organizationName={session.organization.name}
          />
        ) : (
          <InboxPage organizationId={organizationId} />
        )}
        </AppLayout>
        <WorkspaceModal
          open={workspaceModalOpen}
          currentOrganizationId={session.organization.id}
          memberships={session.memberships}
          onClose={() => setWorkspaceModalOpen(false)}
          onSwitch={async (nextOrganizationId) => {
            await switchOrganization(nextOrganizationId);
            setActiveKey("dashboard");
          }}
          onCreate={async (name) => {
            await createOrganization(name);
            setActiveKey("dashboard");
          }}
        />
      </>
      )}
    </>
  );
}

export default App;
