import type { ReactNode } from "react";

export interface StatCardProps {
  readonly icon: ReactNode;
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly unit?: ReactNode;
  readonly trend?: ReactNode;
  readonly trendClassName?: string;
  readonly note?: ReactNode;
  readonly visual?: ReactNode;
  readonly tone?: string;
  readonly className?: string;
}

export function StatCard({
  className,
  icon,
  label,
  note,
  tone,
  trend,
  trendClassName,
  unit,
  value,
  visual,
}: StatCardProps) {
  return (
    <article className={["od-stat-card", "stat-card", tone ? `od-stat-card-${tone}` : null, className].filter(Boolean).join(" ")}>
      <div className="od-stat-top stat-top">
        <span className="od-stat-label stat-label">{label}</span>
        <span className={["od-stat-icon", "stat-icon", tone ? `stat-icon-${tone}` : null].filter(Boolean).join(" ")}>{icon}</span>
      </div>
      <strong>
        {value}
        {unit ? <span className="od-stat-unit">{unit}</span> : null}
      </strong>
      {trend || note ? (
        <span className={["od-stat-trend", "stat-trend", trendClassName].filter(Boolean).join(" ")}>
          {trend} {note ? <em>{note}</em> : null}
        </span>
      ) : null}
      {visual}
    </article>
  );
}
