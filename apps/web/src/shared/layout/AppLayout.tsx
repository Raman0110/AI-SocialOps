import { Avatar, Popover } from "antd";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  RobotOutlined,
  SettingOutlined,
  TeamOutlined,
  CollapseIcon,
  ExpandIcon,
} from "../icons";

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
  /** Small status label next to the workspace name, e.g. "Trial". */
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
  onLogout?: () => void;
  canManageOrganization?: boolean;
  children: ReactNode;
}

/* -------------------------------------------------------------------------- */
/* Shared bits                                                                */
/* -------------------------------------------------------------------------- */

const iconButton =
  "grid size-8 shrink-0 place-items-center rounded-md text-base text-fg-muted transition-colors duration-150 hover:bg-black/5 hover:text-fg active:bg-black/[0.08]";

function WorkspaceSwitcher({
  tenant,
  collapsed,
  onClick,
}: {
  tenant: Tenant;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const initial = tenant.name.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? `${tenant.name} · Switch workspace` : "Switch workspace"}
      aria-label={`Workspace: ${tenant.name}. Switch workspace`}
      className={`flex h-10 w-full items-center rounded-md text-left transition-colors duration-150 hover:bg-black/5 ${
        collapsed ? "justify-center" : "gap-2.5 px-2"
      }`}
    >
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-md bg-accent text-xs font-semibold text-[var(--accent-contrast)]"
      >
        {initial}
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{tenant.name}</span>
          {tenant.badge && (
            <span className="rounded-sm border border-line px-1.5 text-[11px] font-medium leading-5 text-fg-muted">
              {tenant.badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function NavButton({
  label,
  icon,
  active,
  collapsed,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`group relative flex h-8 w-full items-center rounded-md text-sm transition-colors duration-150 ${
        collapsed ? "justify-center" : "gap-2.5 px-2.5"
      } ${
        active
          ? "bg-black/[0.06] font-medium text-fg"
          : "text-fg-secondary hover:bg-black/5 hover:text-fg"
      }`}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute -left-3 top-1.5 h-5 w-0.5 rounded-r-full bg-accent"
        />
      )}
      <span className={`text-base ${active ? "text-accent-fg" : "text-fg-muted group-hover:text-fg-secondary"}`}>
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

function UserRow({
  user,
  collapsed,
  onLogout,
}: {
  user: CurrentUser;
  collapsed: boolean;
  onLogout?: () => void;
}) {
  const card = (
    <div className="w-56">
      <p className="m-0 break-words text-[13px] font-medium text-fg">{user.name}</p>
      <p className="m-0 text-xs text-fg-muted">{user.role}</p>
      <button
        type="button"
        onClick={onLogout}
        className="mt-3 flex h-8 w-full items-center gap-2 rounded-md px-2 text-[13px] text-fg-secondary transition-colors duration-150 hover:bg-inset hover:text-fg"
      >
        <LogoutOutlined /> Sign out
      </button>
    </div>
  );

  return (
    <Popover content={card} trigger="click" placement="topLeft" arrow={false}>
      <button
        type="button"
        aria-label={`Account menu for ${user.name}`}
        title={user.name}
        className={`flex h-10 w-full items-center rounded-md text-left transition-colors duration-150 hover:bg-black/5 ${
          collapsed ? "justify-center" : "gap-2.5 px-2"
        }`}
      >
        <Avatar size={24} src={user.avatarUrl} className="shrink-0 !bg-inset !text-xs !font-medium !text-fg-secondary">
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-4 text-fg">{user.name}</span>
            <span className="block truncate text-xs leading-4 text-fg-muted">{user.role}</span>
          </span>
        )}
      </button>
    </Popover>
  );
}

function SidebarContent({
  activeKey,
  tenant,
  user,
  collapsed,
  onToggleCollapsed,
  onNavigate,
  onSwitchWorkspace,
  onLogout,
  canManageOrganization,
}: {
  activeKey: NavKey;
  tenant: Tenant;
  user: CurrentUser;
  collapsed: boolean;
  /** Present only on the desktop/tablet sidebar. */
  onToggleCollapsed?: () => void;
  onNavigate: (key: NavKey) => void;
  onSwitchWorkspace?: () => void;
  onLogout?: () => void;
  canManageOrganization: boolean;
}) {
  return (
    <>
      <div className="px-3 pb-2 pt-3">
        <WorkspaceSwitcher tenant={tenant} collapsed={collapsed} onClick={onSwitchWorkspace} />
      </div>

      <nav
        aria-label="Main navigation"
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4 pt-2"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && <div className="eyebrow mb-1 px-2.5">{group.title}</div>}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavButton
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  active={activeKey === item.key}
                  collapsed={collapsed}
                  onClick={() => onNavigate(item.key)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        {canManageOrganization &&
          FOOTER_NAV.map((item) => (
            <NavButton
              key={item.key}
              label={item.label}
              icon={item.icon}
              active={activeKey === item.key}
              collapsed={collapsed}
              onClick={() => onNavigate(item.key)}
            />
          ))}
        <UserRow user={user} collapsed={collapsed} onLogout={onLogout} />
        {onToggleCollapsed && (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapsed}
            className={`flex h-8 w-full items-center rounded-md text-[13px] text-fg-muted transition-colors duration-150 hover:bg-black/5 hover:text-fg ${
              collapsed ? "justify-center" : "gap-2.5 px-2.5"
            }`}
          >
            <span className="text-base">{collapsed ? <ExpandIcon /> : <CollapseIcon />}</span>
            {!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

/** True at >=1280px; below that the sidebar is icons-only (tablet). */
function useIsWide() {
  const query = "(min-width: 1280px)";
  const [wide, setWide] = useState(() => window.matchMedia?.(query).matches ?? true);

  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const onChange = () => setWide(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return wide;
}

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
  onLogout,
  canManageOrganization = false,
  children,
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isWide = useIsWide();
  const collapsed = isSidebarCollapsed || !isWide;

  const handleNavigate = (key: NavKey) => {
    onNavigate?.(key);
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex h-screen bg-canvas text-fg">
      {/* Tablet / desktop sidebar: icons-only below 1280px */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-line bg-sidebar transition-[width] duration-150 ease-out md:flex ${
          collapsed ? "w-14" : "w-60"
        }`}
      >
        <SidebarContent
          activeKey={activeKey}
          tenant={tenant}
          user={user}
          collapsed={collapsed}
          onToggleCollapsed={isWide ? () => setIsSidebarCollapsed((current) => !current) : undefined}
          onNavigate={handleNavigate}
          onSwitchWorkspace={onSwitchWorkspace}
          onLogout={onLogout}
          canManageOrganization={canManageOrganization}
        />
      </aside>

      {/* Mobile drawer */}
      {isMobileSidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            aria-label="Close navigation"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-line bg-sidebar shadow-md md:hidden"
          >
            <SidebarContent
              activeKey={activeKey}
              tenant={tenant}
              user={user}
              collapsed={false}
              onNavigate={handleNavigate}
              onSwitchWorkspace={onSwitchWorkspace}
              onLogout={onLogout}
              canManageOrganization={canManageOrganization}
            />
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Open navigation"
              className={`${iconButton} md:hidden`}
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <MenuOutlined />
            </button>
            <div className="flex min-w-0 items-baseline gap-3">
              <h1 className="m-0 shrink-0 text-[20px] font-semibold leading-7 tracking-tight text-fg">
                {pageTitle}
              </h1>
              {pageDescription && (
                <p className="m-0 hidden min-w-0 truncate text-xs text-fg-muted md:block">
                  {pageDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isMockData && (
              <span className="mr-2 rounded-full border border-line-strong px-2 text-xs font-medium leading-5 text-fg-secondary">
                Mock data
              </span>
            )}
            <button type="button" aria-label="Notifications" className={`${iconButton} relative`}>
              <BellOutlined />
              {hasUnreadNotifications && (
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" />
              )}
            </button>
          </div>
        </header>

        <main className={`min-w-0 flex-1 overflow-auto ${flush ? "" : "p-4 sm:p-6"}`}>{children}</main>
      </div>
    </div>
  );
}
