import type { ReactNode } from "react";

import { classes } from "./classes.js";

export interface MetricTileProps {
  readonly label: ReactNode;
  /** The value, already formatted. */
  readonly value: ReactNode;
  /** The change from the period before, already formatted, for example "+12%". */
  readonly change?: string | null;
  /** The direction of the change. It sets the colour. */
  readonly trend?: "up" | "down" | "flat";
  readonly className?: string;
}

/** One key number with its change from the period before. */
export function MetricTile({
  change = null,
  className,
  label,
  trend = "flat",
  value,
}: MetricTileProps) {
  return (
    <div className={classes("od-metric", className)}>
      <dt className="od-metric-label">{label}</dt>
      <dd className="od-metric-value">
        {value}
        {change === null ? null : (
          <span className="od-metric-change" data-trend={trend}>
            {change}
          </span>
        )}
      </dd>
    </div>
  );
}
