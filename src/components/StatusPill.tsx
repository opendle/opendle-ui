import type { ReactNode } from "react";
import { StatusDot, type StatusTone } from "./StatusDot.js";

export interface StatusPillProps {
  readonly tone: StatusTone;
  readonly children: ReactNode;
  readonly className?: string;
}

export function StatusPill({ tone, children, className }: StatusPillProps) {
  return (
    <span
      className={["od-status-pill", `od-status-${tone}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}
