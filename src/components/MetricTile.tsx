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
  /**
   * One value per day of the period, for a small line under the value.
   * `null` is a day without a value. Fewer than two values give no line.
   */
  readonly points?: readonly (number | null)[];
  readonly className?: string;
}

const width = 100;
const height = 32;
/** The line keeps this space from the top and the bottom of its box. */
const inset = 3;

/**
 * A smooth path through the points that does not go above or below them
 * between two points (monotone cubic interpolation).
 */
function smoothPath(points: readonly (readonly [number, number])[]): string {
  const count = points.length;
  const slopes = points.slice(1).map(([x, y], index) => {
    const [previousX, previousY] = points[index] ?? [x, y];
    return x === previousX ? 0 : (y - previousY) / (x - previousX);
  });
  const tangents = points.map((_, index) => {
    if (index === 0) return slopes[0] ?? 0;
    if (index === count - 1) return slopes.at(-1) ?? 0;
    const before = slopes[index - 1] ?? 0;
    const after = slopes[index] ?? 0;
    return before * after <= 0 ? 0 : (2 * before * after) / (before + after);
  });
  return points
    .map(([x, y], index) => {
      if (index === 0) return `M${String(x)} ${String(y)}`;
      const [previousX, previousY] = points[index - 1] ?? [x, y];
      const step = (x - previousX) / 3;
      const first = previousY + step * (tangents[index - 1] ?? 0);
      const second = y - step * (tangents[index] ?? 0);
      return `C${String(previousX + step)} ${String(first)} ${String(x - step)} ${String(second)} ${String(x)} ${String(y)}`;
    })
    .join("");
}

function Sparkline({
  points,
}: {
  readonly points: readonly (number | null)[];
}) {
  const known = points.flatMap((value, index) =>
    value === null ? [] : [[index, value] as const],
  );
  if (known.length < 2) return null;
  const values = known.map(([, value]) => value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = high - low;
  const last = Math.max(1, points.length - 1);
  const placed = known.map(
    ([index, value]) =>
      [
        (index / last) * width,
        range === 0
          ? height / 2
          : inset + (1 - (value - low) / range) * (height - 2 * inset),
      ] as const,
  );
  const line = smoothPath(placed);
  const startX = placed[0]?.[0] ?? 0;
  const endX = placed.at(-1)?.[0] ?? width;
  return (
    <dd aria-hidden="true" className="od-metric-spark">
      <svg
        preserveAspectRatio="none"
        viewBox={`0 0 ${String(width)} ${String(height)}`}
      >
        <path
          className="od-metric-spark-area"
          d={`${line}L${String(endX)} ${String(height)}L${String(startX)} ${String(height)}Z`}
        />
        <path className="od-metric-spark-line" d={line} />
      </svg>
    </dd>
  );
}

/** One key number with its change from the period before. */
export function MetricTile({
  change = null,
  className,
  label,
  points,
  trend = "flat",
  value,
}: MetricTileProps) {
  return (
    <div className={classes("od-metric", className)} data-trend={trend}>
      <dt className="od-metric-label">{label}</dt>
      <dd className="od-metric-value">
        {value}
        {change === null ? null : (
          <span className="od-metric-change" data-trend={trend}>
            {change}
          </span>
        )}
      </dd>
      {points === undefined ? null : <Sparkline points={points} />}
    </div>
  );
}
