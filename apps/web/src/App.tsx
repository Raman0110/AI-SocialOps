import { ConfigProvider } from "antd";
import { useState } from "react";
import { AiActionsPage } from "./modules/ai-actions/pages/AiActionsPage";
import { CustomersPage } from "./modules/customers/pages/CustomersPage";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage";
import { InboxPage } from "./modules/inbox/pages/InboxPage";
import { SocialAccountsPage } from "./modules/social-accounts/pages/SocialAccountsPage";
import { AppLayout } from "./shared/layout";
import type { NavKey } from "./shared/layout/AppLayout";

function App() {
  const [activeKey, setActiveKey] = useState<NavKey>("dashboard");
  const organizationId =
    import.meta.env.VITE_ORGANIZATION_ID ??
    "00000000-0000-0000-0000-000000000001";

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
  };
  const currentPageMeta = pageMeta[activeKey] ?? pageMeta.dashboard;

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 8,
          colorPrimary: "#0ea5e9",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
      }}
    >
      <AppLayout
        activeKey={activeKey}
        tenant={{ name: "UrbanThreads", badge: "Mock" }}
        user={{ name: "Development Owner", role: "Owner access" }}
        pageTitle={currentPageMeta.title}
        pageDescription={currentPageMeta.description}
        isMockData
        onNavigate={(key) => {
          if (
            key === "dashboard" ||
            key === "inbox" ||
            key === "customers" ||
            key === "ai-actions" ||
            key === "social-accounts"
          ) {
            setActiveKey(key);
          }
        }}
      >
        {activeKey === "dashboard" ? (
          <DashboardPage
            onOpenInbox={() => setActiveKey("inbox")}
            onOpenAiActions={() => setActiveKey("ai-actions")}
          />
        ) : activeKey === "customers" ? (
          <CustomersPage onOpenInbox={() => setActiveKey("inbox")} />
        ) : activeKey === "social-accounts" ? (
          <SocialAccountsPage />
        ) : activeKey === "ai-actions" ? (
          <AiActionsPage />
        ) : (
          <InboxPage organizationId={organizationId} />
        )}
      </AppLayout>
    </ConfigProvider>
  );
}

export default App;
