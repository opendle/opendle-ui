import type { ReactNode } from "react";

export interface ContextItemProps {
  readonly icon: ReactNode;
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly className?: string;
  readonly iconClassName?: string;
}

export function ContextItem({ icon, iconClassName, label, value, className }: ContextItemProps) {
  return (
    <div className={["od-context-item", className].filter(Boolean).join(" ")}>
      <span className={["od-context-icon", iconClassName].filter(Boolean).join(" ")}>{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}
