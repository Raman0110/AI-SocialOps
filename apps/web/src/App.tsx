import { ConfigProvider } from "antd";
import { useState } from "react";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage";
import { InboxPage } from "./modules/inbox/pages/InboxPage";
import { AppLayout } from "./shared/layout";
import type { NavKey } from "./shared/layout/AppLayout";

function App() {
  const [activeKey, setActiveKey] = useState<NavKey>("dashboard");
  const organizationId =
    import.meta.env.VITE_ORGANIZATION_ID ??
    "00000000-0000-0000-0000-000000000001";

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
        pageTitle={activeKey === "dashboard" ? "Dashboard" : "Inbox"}
        pageDescription={activeKey === "dashboard" ? "Customer support performance at a glance" : undefined}
        isMockData
        onNavigate={(key) => {
          if (key === "dashboard" || key === "inbox") setActiveKey(key);
        }}
      >
        {activeKey === "dashboard" ? (
          <DashboardPage
            onOpenInbox={() => setActiveKey("inbox")}
            onOpenAiActions={() => setActiveKey("inbox")}
          />
        ) : (
          <InboxPage organizationId={organizationId} />
        )}
      </AppLayout>
    </ConfigProvider>
  );
}

export default App;
