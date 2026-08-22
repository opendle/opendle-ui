import type { ElementType, ReactNode } from "react";

import { Icon } from "../index.js";
import { Button } from "./Button.js";
import { Panel, type PanelProps } from "./Panel.js";

export type StatePanelKind = "loading" | "empty" | "error";

export interface StatePanelProps extends Omit<PanelProps, "title"> {
  readonly title: ReactNode;
  readonly kind?: StatePanelKind;
  readonly icon?: ReactNode;
  readonly actions?: ReactNode;
  readonly headingLevel?: "h2" | "h3";
  readonly retryLabel?: ReactNode;
  readonly onRetry?: () => void;
}

/** A status panel for loading, empty, and recoverable error states. */
export function StatePanel({
  actions,
  children,
  className,
  headingLevel = "h2",
  icon,
  kind = "loading",
  onRetry,
  retryLabel = "Try again",
  role = kind === "error" ? "alert" : "status",
  title,
  ...props
}: StatePanelProps) {
  const Heading = headingLevel as ElementType;
  const stateIcon = icon ?? (
    <Icon
      name={
        kind === "error" ? "warning" : kind === "empty" ? "list" : "refresh"
      }
      size={23}
    />
  );
  return (
    <Panel
      {...props}
      className={["od-state-panel", `od-state-panel-${kind}`, className]
        .filter(Boolean)
        .join(" ")}
      role={role}
    >
      <span className="od-state-panel-icon">{stateIcon}</span>
      <div className="od-state-panel-copy">
        <Heading>{title}</Heading>
        <div className="od-state-panel-description">{children}</div>
      </div>
      {actions || onRetry ? (
        <div className="od-state-panel-actions">
          {actions}
          {onRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}
