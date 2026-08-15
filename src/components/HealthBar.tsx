import { useId, type HTMLAttributes, type ReactNode } from "react";

export interface HealthBarProps extends HTMLAttributes<HTMLDivElement> {
  readonly label: ReactNode;
  readonly value: number;
  readonly valueLabel?: ReactNode;
  readonly tone?: "lime" | "blue" | "amber" | "red";
}

export function HealthBar({
  className,
  label,
  tone = "lime",
  value,
  valueLabel,
  ...props
}: HealthBarProps) {
  const labelId = useId();
  const boundedValue = Math.max(0, Math.min(100, value));
  return (
    <div {...props} className={["od-health-bar", className].filter(Boolean).join(" ")}>
      <div className="od-health-bar-label">
        <span id={labelId}>{label}</span>
        <strong>{valueLabel ?? `${String(boundedValue)}%`}</strong>
      </div>
      <div className="od-health-bar-track" role="progressbar" aria-labelledby={labelId} aria-valuenow={boundedValue} aria-valuemin={0} aria-valuemax={100}>
        <span className={`od-health-bar-fill od-health-${tone}`} style={{ width: `${String(boundedValue)}%` }} />
      </div>
    </div>
  );
}
