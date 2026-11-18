import type { ReactNode } from "react";

/** One icon, one line, at most one action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center px-6 py-10 text-center ${className}`}>
      {icon && <span aria-hidden="true" className="mb-2 flex text-lg text-fg-muted">{icon}</span>}
      <p className="m-0 text-[13px] font-medium text-fg">{title}</p>
      {description && <p className="m-0 mt-0.5 max-w-xs text-xs text-fg-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
