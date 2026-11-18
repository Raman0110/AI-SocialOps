import type { ReactNode } from "react";

/** The single white surface level. Sections inside use dividers, not borders. */
export function Panel({
  children,
  className = "",
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-lg border border-line bg-surface ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function PanelHeader({
  title,
  description,
  actions,
  id,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
      <div className="min-w-0">
        <h2 id={id} className="m-0 text-sm font-semibold leading-5 text-fg">
          {title}
        </h2>
        {description && <p className="m-0 text-xs text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Divided section inside a panel. */
export function PanelSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border-t border-line px-5 py-4 ${className}`}>{children}</div>;
}

/** Well inside a panel (code, payloads, IDs): fill only, no border. */
export function Inset({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-md bg-inset p-3 ${className}`}>{children}</div>;
}
