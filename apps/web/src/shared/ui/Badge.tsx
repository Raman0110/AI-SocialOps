import type { ReactNode } from "react";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashedCircleIcon,
  DisconnectOutlined,
  ExclamationCircleOutlined,
  InfoIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "../icons";
import { PlatformIcon } from "./PlatformIcon";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

/** Colour lives in the icon only; label text always stays neutral. */
const iconTone: Record<Tone, string> = {
  neutral: "text-fg-muted",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-accent",
};

interface BadgeProps {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Outlined pill with a leading icon. */
export function Badge({ tone = "neutral", icon, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-line-strong px-2 text-xs font-medium leading-none text-fg-secondary ${className}`}
    >
      {icon && (
        <span aria-hidden="true" className={`flex text-[13px] ${iconTone[tone]}`}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

const statusMap: Record<string, { tone: Tone; icon: ReactNode }> = {
  open: { tone: "info", icon: <DashedCircleIcon /> },
  pending: { tone: "warning", icon: <ClockCircleOutlined /> },
  queued: { tone: "warning", icon: <ClockCircleOutlined /> },
  running: { tone: "info", icon: <DashedCircleIcon /> },
  resolved: { tone: "success", icon: <CheckCircleOutlined /> },
  approved: { tone: "success", icon: <CheckCircleOutlined /> },
  completed: { tone: "success", icon: <CheckCircleOutlined /> },
  succeeded: { tone: "success", icon: <CheckCircleOutlined /> },
  success: { tone: "success", icon: <CheckCircleOutlined /> },
  connected: { tone: "success", icon: <CheckCircleOutlined /> },
  healthy: { tone: "success", icon: <CheckCircleOutlined /> },
  escalated: { tone: "danger", icon: <ShieldAlertIcon /> },
  failed: { tone: "danger", icon: <XCircleIcon /> },
  rejected: { tone: "danger", icon: <XCircleIcon /> },
  error: { tone: "danger", icon: <XCircleIcon /> },
  disconnected: { tone: "danger", icon: <XCircleIcon /> },
  failing: { tone: "danger", icon: <XCircleIcon /> },
  "needs reauth": { tone: "warning", icon: <ExclamationCircleOutlined /> },
  disabled: { tone: "neutral", icon: <DisconnectOutlined /> },
  "not configured": { tone: "neutral", icon: <ClockCircleOutlined /> },
};

/** Maps a status string to tone + icon; unknown statuses render neutral. */
export function StatusBadge({ status, children }: { status: string; children?: ReactNode }) {
  const match = statusMap[status.toLowerCase()] ?? { tone: "neutral" as Tone, icon: <InfoIcon /> };

  return (
    <Badge tone={match.tone} icon={match.icon}>
      {children ?? status}
    </Badge>
  );
}

/** Risk level: calm for low/medium, a small red shield for high. */
export function RiskBadge({ level }: { level: string }) {
  const key = level.toLowerCase();
  const tone: Tone = key === "high" ? "danger" : key === "medium" ? "warning" : "success";
  const icon = key === "high" || key === "medium" ? <ShieldAlertIcon /> : <ShieldCheckIcon />;

  return (
    <Badge tone={tone} icon={icon}>
      {level} risk
    </Badge>
  );
}

/** Platform: brand mark + neutral text. */
export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <Badge icon={<PlatformIcon platform={platform} />}>{platform}</Badge>
  );
}
