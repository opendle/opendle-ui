import type { ReactNode } from "react";

export interface PlanCardShellProps {
  readonly ariaLabel: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly compact?: boolean;
  readonly icon: ReactNode;
  readonly meta: ReactNode;
  readonly state: string;
  readonly title: ReactNode;
  readonly age: ReactNode;
}

export function PlanCardShell({
  age,
  ariaLabel,
  children,
  className,
  compact = false,
  icon,
  meta,
  state,
  title,
}: PlanCardShellProps) {
  return (
    <article
      aria-label={ariaLabel}
      className={["od-plan-card", "shared-plan-card", className]
        .filter(Boolean)
        .join(" ")}
      data-compact={compact}
      data-state={state}
    >
      <div className="plan-heading">
        <span>{icon}</span>
        <div>
          <small>{meta}</small>
          <strong>{title}</strong>
        </div>
        <span className="plan-age">{age}</span>
      </div>
      {children}
    </article>
  );
}
