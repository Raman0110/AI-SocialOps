import type { ReactNode } from "react";
import { isMissing } from "./isMissing";

/** Missing values are small and muted, never styled like a real metric. */
export function NotAvailable({ label = "–" }: { label?: string }) {
  return (
    <span className="text-xs text-fg-muted" title="Not available">
      {label}
    </span>
  );
}

export interface KeyValueItem {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

/** Compact metadata list: 12px muted keys, 13px values. */
export function KeyValue({ items }: { items: KeyValueItem[] }) {
  return (
    <dl className="m-0 grid grid-cols-[minmax(96px,128px)_minmax(0,1fr)] gap-x-4 gap-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-xs leading-5 text-fg-muted">{item.label}</dt>
          <dd className={`m-0 min-w-0 break-words text-[13px] leading-5 text-fg ${item.mono ? "mono" : ""}`}>
            {isMissing(item.value) ? <NotAvailable /> : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
