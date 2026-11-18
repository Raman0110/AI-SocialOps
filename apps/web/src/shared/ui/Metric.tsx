import { Tooltip } from "antd";
import type { ReactNode } from "react";
import { InfoIcon } from "../icons";
import { NotAvailable } from "./KeyValue";
import { isMissing } from "./isMissing";
import { Skeleton } from "./Skeleton";

/** Hand-drawn sparkline; only rendered when real series data is passed. */
export function Sparkline({ data, className = "" }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const width = 72;
  const height = 24;
  const min = Math.min(...data);
  const span = Math.max(...data) - min || 1;
  const points = data
    .map((value, index) => `${(index / (data.length - 1)) * width},${height - 2 - ((value - min) / span) * (height - 4)}`)
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className={`text-fg-muted ${className}`}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface MetricProps {
  label: string;
  value: string | number | null | undefined;
  /** Explanation shown in a tooltip, keeps the cell compact. */
  description?: string;
  loading?: boolean;
  /** Optional change indicator, e.g. "+3 today". Omit when there is no baseline. */
  delta?: ReactNode;
  /** Optional series for the sparkline slot. */
  trend?: number[];
  tone?: "default" | "danger";
}

export function Metric({ label, value, description, loading, delta, trend, tone = "default" }: MetricProps) {
  const missing = isMissing(value);

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        <span className="eyebrow">{label}</span>
        {description && (
          <Tooltip title={description}>
            <button type="button" aria-label={`About ${label}`} className="flex rounded-sm text-xs text-fg-muted hover:text-fg">
              <InfoIcon />
            </button>
          </Tooltip>
        )}
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-6 w-12" />
          ) : missing ? (
            <NotAvailable />
          ) : (
            <span
              className={`tnum text-[24px] font-semibold leading-8 tracking-tight ${
                tone === "danger" && Number(value) > 0 ? "text-danger-text" : "text-fg"
              }`}
            >
              {value}
            </span>
          )}
          {delta && !loading && <div className="text-xs text-fg-muted">{delta}</div>}
        </div>
        {trend && !loading && <Sparkline data={trend} />}
      </div>
    </div>
  );
}
