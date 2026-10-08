import { ConfigProvider } from "antd";
import { InboxPage } from "./modules/inbox/pages/InboxPage";
import { AppLayout } from "./shared/layout";

function App() {
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
        activeKey="inbox"
        tenant={{ name: "UrbanThreads", badge: "Mock" }}
        user={{ name: "Development Owner", role: "Owner access" }}
        pageTitle="Inbox"
        isMockData
      >
        <InboxPage organizationId={organizationId} />
      </AppLayout>
    </ConfigProvider>
  );
}

export default App;
