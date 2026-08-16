import type { ReactNode } from "react";

export interface ChainStepProps {
  readonly number: ReactNode;
  readonly title: ReactNode;
  readonly detail: ReactNode;
  readonly tone: "lime" | "slate";
  readonly status: ReactNode;
  readonly className?: string;
}

export function ChainStep({
  className,
  detail,
  number,
  status,
  title,
  tone,
}: ChainStepProps) {
  return (
    <div
      className={[
        "od-chain-step",
        "chain-step",
        tone === "lime" ? "od-chain-step-current current" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{number}</span>
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
      <span className={["od-status-pill", `od-status-${tone}`].join(" ")}>
        <span aria-hidden="true" className="od-status-dot" />
        {status}
      </span>
    </div>
  );
}
