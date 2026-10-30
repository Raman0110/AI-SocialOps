import {
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  DashboardOutlined,
  DownOutlined,
  LeftOutlined,
  MenuOutlined,
  MessageOutlined,
  RobotOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, ConfigProvider, Layout, Tag, Typography } from "antd";
import type { ThemeConfig } from "antd";
import { useState } from "react";
import type { ReactNode } from "react";

const { Content, Header } = Layout;
const { Text } = Typography;

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const color = {
  ink: "#0F172A",
  textMuted: "#64748B",
  border: "#E5E7EB",
  canvas: "#F8FAFC",
  surface: "#FFFFFF",
  accent: "#2F5BEA",
  accentSoft: "#E8EEFD",
  hover: "#E5E7EB",
} as const;

/**
 * All visual styling for antd lives here, so the JSX below stays free of
 * custom CSS classes and overrides.
 */
const appTheme: ThemeConfig = {
  token: {
    colorPrimary: color.accent,
    colorText: color.ink,
    colorTextSecondary: color.textMuted,
    colorBorder: color.border,
    colorBorderSecondary: color.border,
    borderRadius: 8,
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: color.surface,
      headerBg: color.surface,
      bodyBg: color.canvas,
      headerHeight: 64,
      headerPadding: "0 24px",
    },
    Tag: { defaultBg: color.hover, defaultColor: color.textMuted },
  },
};

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [{ key: "dashboard", label: "Dashboard", icon: <DashboardOutlined /> }],
  },
  {
    title: "Conversations",
    items: [
      { key: "inbox", label: "Inbox", icon: <MessageOutlined /> },
      { key: "customers", label: "Customers", icon: <TeamOutlined /> },
    ],
  },
  {
    title: "Automation",
    items: [
      { key: "ai-actions", label: "AI Actions", icon: <RobotOutlined /> },
      { key: "agent-runs", label: "Agent Runs", icon: <AuditOutlined /> },
      { key: "knowledge", label: "Knowledge", icon: <BookOutlined /> },
    ],
  },
  {
    title: "Channels",
    items: [{ key: "social-accounts", label: "Social Accounts", icon: <AppstoreOutlined /> }],
  },
] as const;

const FOOTER_NAV = [{ key: "settings", label: "Settings", icon: <SettingOutlined /> }] as const;

export type NavKey =
  | (typeof NAV_GROUPS)[number]["items"][number]["key"]
  | (typeof FOOTER_NAV)[number]["key"];

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface Tenant {
  name: string;
  /** Small status tag next to the workspace name, e.g. "Trial". */
  badge?: string;
}

export interface CurrentUser {
  name: string;
  role: string;
  avatarUrl?: string;
}

interface AppLayoutProps {
  activeKey: NavKey;
  tenant: Tenant;
  user: CurrentUser;
  pageTitle: string;
  pageDescription?: string;
  isMockData?: boolean;
  hasUnreadNotifications?: boolean;
  /** Remove the default content padding (for full-bleed pages like Inbox). */
  flush?: boolean;
  onNavigate?: (key: NavKey) => void;
  onSwitchWorkspace?: () => void;
  children: ReactNode;
}

function WorkspaceSwitcher({
  tenant,
  collapsed,
  onClick,
}: {
  tenant: Tenant;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? tenant.name : undefined}
      className={`flex w-full items-center rounded-xl border border-white/15 bg-white/10 p-2.5 text-left text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${collapsed ? "justify-center" : "gap-2.5"
        }`}
    >
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold uppercase tracking-wider">
              {tenant.name}
            </span>
            <span className="block truncate text-[10px] text-white/55">Active workspace</span>
          </span>
          {tenant.badge && <Tag className="m-0 border-none text-xs">{tenant.badge}</Tag>}
          <DownOutlined className="text-[10px] text-white/55" />
        </>
      )}
    </button>
  );
}

function UserRow({ user, collapsed }: { user: CurrentUser; collapsed: boolean }) {
  return (
    <div className={`flex items-center rounded-xl px-2 py-2 text-white transition-colors hover:bg-white/10 ${collapsed ? "justify-center" : "gap-2.5"}`}>
      <Badge dot status="success" offset={[-2, 26]}>
        <Avatar size={32} src={user.avatarUrl} className="bg-blue-600">
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>
      {!collapsed && (
        <div className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium">{user.name}</span>
          <span className="block truncate text-xs text-white/55">{user.role}</span>
        </div>
      )}
    </div>
  );
}

function SidebarBrand({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      className="absolute -right-3.5 top-1/2 z-20 hidden size-7 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 lg:grid"
    >
      <LeftOutlined className={`text-xs transition-transform ${collapsed ? "rotate-180" : ""}`} />
    </button>
  );
}

function SidebarContent({
  activeKey,
  tenant,
  user,
  collapsed,
  onToggle,
  onNavigate,
  onSwitchWorkspace,
}: {
  activeKey: NavKey;
  tenant: Tenant;
  user: CurrentUser;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: (key: NavKey) => void;
  onSwitchWorkspace?: () => void;
}) {
  const renderNavButton = (item: (typeof NAV_GROUPS)[number]["items"][number]) => {
    const isActive = activeKey === item.key;

    return (
      <button
        key={item.key}
        type="button"
        title={collapsed ? item.label : undefined}
        onClick={() => onNavigate?.(item.key)}
        className={`flex w-full items-center rounded-xl py-2 text-sm outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-white/40 ${collapsed ? "justify-center px-0" : "gap-3 px-3"
          } ${isActive
            ? "border border-white/20 bg-white/15 font-semibold text-white shadow-sm hover:bg-white/20"
            : "border border-transparent text-white/75 hover:bg-white/10 hover:text-white"
          }`}
      >
        <span className="text-base">{item.icon}</span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  return (
    <>
      <SidebarBrand collapsed={collapsed} onToggle={onToggle} />

      <nav aria-label="Main navigation" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
        <div className="mb-4">
          <WorkspaceSwitcher
            tenant={tenant}
            collapsed={collapsed}
            onClick={onSwitchWorkspace}
          />
        </div>

        <div className="space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">{group.items.map(renderNavButton)}</div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        {FOOTER_NAV.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => onNavigate?.(item.key)}
              className={`mb-1 flex w-full items-center rounded-xl py-2 text-sm transition ${collapsed ? "justify-center px-0" : "gap-3 px-3"
                } ${isActive ? "bg-white/15 font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
        <UserRow user={user} collapsed={collapsed} />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function AppLayout({
  activeKey,
  tenant,
  user,
  pageTitle,
  pageDescription,
  isMockData = false,
  hasUnreadNotifications = false,
  flush = false,
  onNavigate,
  onSwitchWorkspace,
  children,
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleNavigate = (key: NavKey) => {
    onNavigate?.(key);
    setIsMobileSidebarOpen(false);
  };

  return (
    <ConfigProvider theme={appTheme}>
      <Layout hasSider className="h-screen">
        <aside
          className={`relative hidden shrink-0 flex-col border-r border-white/10 bg-[#343A40] text-white transition-[width] duration-200 lg:flex ${isSidebarCollapsed ? "w-20" : "w-72"
            }`}
        >
          <SidebarContent
            activeKey={activeKey}
            tenant={tenant}
            user={user}
            collapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((current) => !current)}
            onNavigate={handleNavigate}
            onSwitchWorkspace={onSwitchWorkspace}
          />
        </aside>

        {isMobileSidebarOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              aria-label="Close navigation"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#343A40] text-white shadow-xl lg:hidden">
              <SidebarContent
                activeKey={activeKey}
                tenant={tenant}
                user={user}
                collapsed={false}
                onToggle={() => setIsMobileSidebarOpen(false)}
                onNavigate={handleNavigate}
                onSwitchWorkspace={onSwitchWorkspace}
              />
            </aside>
          </>
        )}

        <Layout className="min-w-0">
          <Header className="app-header-shadow flex items-center justify-between border-b border-slate-200 bg-white">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="text"
                shape="circle"
                icon={<MenuOutlined />}
                aria-label="Open navigation"
                className="lg:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
              />
              <div className="min-w-0 leading-tight">
                <h1 className="m-0 truncate text-lg font-semibold tracking-tight text-slate-900">
                  {pageTitle}
                </h1>
                {pageDescription && (
                  <Text type="secondary" className="block truncate text-[13px]">
                    {pageDescription}
                  </Text>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isMockData && <Tag className="m-0 border-none">Mock data</Tag>}
              <Badge dot={hasUnreadNotifications} offset={[-6, 6]}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined />}
                  aria-label="Notifications"
                  className="hover:bg-slate-100 active:bg-slate-200"
                />
              </Badge>
            </div>
          </Header>

          <Content className={`min-w-0 overflow-auto ${flush ? "" : "p-6"}`}>{children}</Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
