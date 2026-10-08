import {
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  DownOutlined,
  MessageOutlined,
  RobotOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, ConfigProvider, Layout, Menu, Tag, Typography } from "antd";
import type { MenuProps, ThemeConfig } from "antd";
import type { ReactNode } from "react";

const { Content, Header, Sider } = Layout;
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
    Menu: {
      itemBg: "transparent",
      itemColor: "#475569",
      itemHoverBg: color.hover,
      itemHoverColor: color.ink,
      itemSelectedBg: color.accentSoft,
      itemSelectedColor: color.accent,
      itemHeight: 36,
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemMarginBlock: 2,
      iconSize: 16,
      groupTitleColor: color.textMuted,
      groupTitleFontSize: 12,
      activeBarBorderWidth: 0,
    },
    Tag: { defaultBg: color.hover, defaultColor: color.textMuted },
  },
};

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const NAV_GROUPS = [
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

const mainMenuItems: MenuProps["items"] = NAV_GROUPS.map((group) => ({
  type: "group",
  key: group.title,
  label: group.title,
  children: group.items.map(({ key, label, icon }) => ({ key, label, icon })),
}));

const footerMenuItems: MenuProps["items"] = FOOTER_NAV.map(({ key, label, icon }) => ({
  key,
  label,
  icon,
}));

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

function WorkspaceSwitcher({ tenant, onClick }: { tenant: Tenant; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left shadow-sm transition-colors hover:bg-slate-100 active:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-blue-50 text-xs font-semibold text-blue-700">
        {tenant.name.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
        {tenant.name}
      </span>
      {tenant.badge && <Tag className="m-0 border-none text-xs">{tenant.badge}</Tag>}
      <DownOutlined className="text-[10px] text-slate-400" />
    </button>
  );
}

function UserRow({ user }: { user: CurrentUser }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-slate-100 active:bg-slate-200">
      <Badge dot status="success" offset={[-2, 26]}>
        <Avatar size={32} src={user.avatarUrl} className="bg-slate-800">
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>
      <div className="min-w-0 flex-1 leading-tight">
        <Text className="block truncate text-sm font-medium">{user.name}</Text>
        <Text type="secondary" className="block truncate text-xs">
          {user.role}
        </Text>
      </div>
    </div>
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
  const handleClick: MenuProps["onClick"] = ({ key }) => onNavigate?.(key as NavKey);

  return (
    <ConfigProvider theme={appTheme}>
      <Layout className="h-screen">
        <Sider
          width={220}
          className="app-sidebar hidden lg:block"
          style={{ background: "#F8FAFC" }}
        >
          <div className="flex h-full flex-col">
            <Menu
              mode="inline"
              selectedKeys={[activeKey]}
              items={mainMenuItems}
              onClick={handleClick}
              className="app-sidebar-menu flex-1 overflow-y-auto border-none"
            />

            <div className="space-y-1 border-t border-slate-200 p-3">
              <Menu
                mode="inline"
                selectedKeys={[activeKey]}
                items={footerMenuItems}
                onClick={handleClick}
                className="app-sidebar-menu border-none"
              />
              <UserRow user={user} />
            </div>
          </div>
        </Sider>

        <Layout>
          <Header className="app-header-shadow flex items-center justify-between border-b border-slate-200 bg-white">
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
