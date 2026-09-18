import type { HTMLAttributes, ReactNode } from "react";

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  readonly children?: ReactNode;
}

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <section
      {...props}
      className={["od-panel", className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}

export interface PanelHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly kicker?: ReactNode;
  readonly actions?: ReactNode;
}

export function PanelHeader({
  actions,
  className,
  description,
  kicker,
  title,
  ...props
}: PanelHeaderProps) {
  return (
    <header
      {...props}
      className={["od-panel-header", className].filter(Boolean).join(" ")}
    >
      <div>
        {kicker ? <p className="od-panel-kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="od-panel-actions">{actions}</div> : null}
    </header>
  );
}

/** A padded panel body with consistent spacing between its content. */
export function PanelBody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={["od-panel-body", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

export interface SummaryFactsProps extends HTMLAttributes<HTMLDListElement> {
  readonly items: readonly {
    readonly label: string;
    readonly value: ReactNode;
  }[];
}

/** Responsive metadata with an explicit label for each value. */
export function SummaryFacts({
  items,
  className,
  ...props
}: SummaryFactsProps) {
  return (
    <dl
      {...props}
      className={["od-summary-facts", className].filter(Boolean).join(" ")}
    >
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
