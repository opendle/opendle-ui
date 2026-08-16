import type { HTMLAttributes } from "react";

export type StatusTone = "amber" | "blue" | "green" | "lime" | "red" | "slate";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: StatusTone;
}

export function StatusDot({
  tone = "green",
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      {...props}
      aria-hidden={props["aria-label"] ? undefined : true}
      className={["od-status-dot", `od-status-${tone}`, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
