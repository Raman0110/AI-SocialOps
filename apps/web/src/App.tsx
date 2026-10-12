import { ConfigProvider } from "antd";
import { useState } from "react";
import { CustomersPage } from "./modules/customers/pages/CustomersPage";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage";
import { InboxPage } from "./modules/inbox/pages/InboxPage";
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
          if (key === "dashboard" || key === "inbox" || key === "customers") {
            setActiveKey(key);
          }
        }}
      >
        {activeKey === "dashboard" ? (
          <DashboardPage
            onOpenInbox={() => setActiveKey("inbox")}
            onOpenAiActions={() => setActiveKey("inbox")}
          />
        ) : activeKey === "customers" ? (
          <CustomersPage onOpenInbox={() => setActiveKey("inbox")} />
        ) : (
          <InboxPage organizationId={organizationId} />
        )}
      </AppLayout>
    </ConfigProvider>
  );
}

export default App;
