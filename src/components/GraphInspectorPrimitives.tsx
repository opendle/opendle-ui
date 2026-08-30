import type { HTMLAttributes, ReactNode } from "react";
import { useId } from "react";

function classes(...values: (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export type GraphInspectorFactsProps = HTMLAttributes<HTMLDListElement>;
export function GraphInspectorFacts({
  className,
  ...props
}: GraphInspectorFactsProps) {
  return (
    <dl {...props} className={classes("od-graph-inspector-facts", className)} />
  );
}

export interface GraphInspectorFactProps extends HTMLAttributes<HTMLDivElement> {
  readonly label: ReactNode;
  readonly value: ReactNode;
}
export function GraphInspectorFact({
  label,
  value,
  className,
  ...props
}: GraphInspectorFactProps) {
  return (
    <div {...props} className={classes("od-graph-inspector-fact", className)}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export interface GraphInspectorSectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: ReactNode;
  readonly count?: ReactNode;
}
export function GraphInspectorSection({
  title,
  count,
  children,
  className,
  ...props
}: GraphInspectorSectionProps) {
  const titleId = useId();
  return (
    <section
      {...props}
      aria-labelledby={titleId}
      className={classes("od-graph-inspector-section", className)}
    >
      <h3 id={titleId}>
        {title}
        {count === undefined ? null : (
          <span className="od-graph-inspector-section-count">{count}</span>
        )}
      </h3>
      <div className="od-graph-inspector-section-content">{children}</div>
    </section>
  );
}

export type GraphInspectorRowsProps = HTMLAttributes<HTMLUListElement>;
export function GraphInspectorRows({
  className,
  ...props
}: GraphInspectorRowsProps) {
  return (
    <ul {...props} className={classes("od-graph-inspector-rows", className)} />
  );
}

export interface GraphInspectorRowProps extends HTMLAttributes<HTMLLIElement> {
  readonly label: ReactNode;
  readonly value?: ReactNode;
  readonly actions?: ReactNode;
}
export function GraphInspectorRow({
  label,
  value,
  actions,
  className,
  ...props
}: GraphInspectorRowProps) {
  return (
    <li {...props} className={classes("od-graph-inspector-row", className)}>
      <div className="od-graph-inspector-row-copy">
        <strong>{label}</strong>
        {value === undefined ? null : <span>{value}</span>}
      </div>
      {actions === undefined ? null : (
        <div className="od-graph-inspector-row-actions">{actions}</div>
      )}
    </li>
  );
}

export type GraphInspectorNoticeTone = "neutral" | "warning" | "error";
export interface GraphInspectorNoticeProps extends HTMLAttributes<HTMLDivElement> {
  readonly tone?: GraphInspectorNoticeTone;
  readonly dynamic?: boolean;
}
export function GraphInspectorNotice({
  tone = "neutral",
  dynamic = false,
  children,
  className,
  ...props
}: GraphInspectorNoticeProps) {
  const stateLabel =
    tone === "warning" ? "Warning" : tone === "error" ? "Error" : null;
  return (
    <div
      {...props}
      className={classes("od-graph-inspector-notice", className)}
      data-tone={tone}
      role={dynamic && tone === "error" ? "alert" : props.role}
    >
      {stateLabel === null ? null : (
        <strong className="od-graph-inspector-notice-state">
          {stateLabel}:
        </strong>
      )}
      <div className="od-graph-inspector-notice-content">{children}</div>
    </div>
  );
}
