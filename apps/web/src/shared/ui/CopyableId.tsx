import { Tooltip } from "antd";
import { useEffect, useState } from "react";
import { CopyIcon, CheckOutlined } from "../icons";

/** Monospace ID, shortened, copied to the clipboard on click. */
export function CopyableId({ value, visible = 8 }: { value: string; visible?: number }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const shortened = value.length > visible + 2 ? `${value.slice(0, visible)}…` : value;

  return (
    <Tooltip title={copied ? "Copied" : `${value} — click to copy`}>
      <button
        type="button"
        aria-label={`Copy ID ${value}`}
        onClick={(event) => {
          event.stopPropagation();
          void navigator.clipboard?.writeText(value).then(() => setCopied(true), () => undefined);
        }}
        className="mono group inline-flex max-w-full items-center gap-1 rounded-sm bg-inset px-1.5 py-0.5 text-fg-secondary transition-colors duration-150 hover:text-fg"
      >
        <span className="truncate">{shortened}</span>
        <span aria-hidden="true" className="flex text-[11px] text-fg-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          {copied ? <CheckOutlined /> : <CopyIcon />}
        </span>
      </button>
    </Tooltip>
  );
}

/** Text that truncates and reveals the full value in a tooltip. */
export function TruncatedText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <Tooltip title={text} mouseEnterDelay={0.4}>
      <span className={`block truncate ${className}`}>{text}</span>
    </Tooltip>
  );
}
