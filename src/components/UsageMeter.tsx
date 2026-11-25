import type { CSSProperties, ReactNode } from "react";

import { classes } from "./classes.js";

export interface UsageMeterItem {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  /** The colour slot, from 0, as in the charts. */
  readonly slot: number;
  /** A second value in the legend, for example a count of files. */
  readonly detail?: ReactNode;
}

export interface UsageMeterLabels {
  /** The text before the limit: "of" gives "2 GB of 10 GB". */
  readonly of: string;
  /** The text of the free amount, for example "8 GB free". */
  readonly free: (amount: string) => string;
  /** The text when the use reaches the limit. */
  readonly full: string;
}

export interface UsageMeterProps {
  /** The accessible name of the meter, for example "Storage". */
  readonly label: string;
  /** The parts of the use. The items without a value stay in the legend. */
  readonly items: readonly UsageMeterItem[];
  /** The maximum. Without a limit, the bar shows the parts of the use only. */
  readonly limit?: number | null;
  readonly formatValue?: (value: number) => string;
  readonly labels?: Partial<UsageMeterLabels>;
  /** Show the legend with the value of each item. The default is `true`. */
  readonly legend?: boolean;
  readonly className?: string;
}

/** The share of the limit from which the meter shows a warning. */
const highShare = 0.8;
const defaultLabels: UsageMeterLabels = {
  of: "of",
  free: (amount) => `${amount} free`,
  full: "Full",
};
const number = new Intl.NumberFormat();
const defaultFormat = (value: number) => number.format(value);

/** `normal`, `high` from 80 % of the limit, or `full`. */
function levelOf(used: number, limit: number | null): string {
  if (limit === null) return "normal";
  if (used >= limit) return "full";
  return used >= limit * highShare ? "high" : "normal";
}

/**
 * The use of a resource with a limit, for example the storage of an
 * account: the total, the limit and the free amount, one bar with a part for
 * each item, and a legend with the value of each item. From 80 % of the
 * limit the meter shows a warning; at the limit it shows that it is full.
 */
export function UsageMeter({
  className,
  formatValue = defaultFormat,
  items,
  label,
  labels,
  legend = true,
  limit = null,
}: UsageMeterProps) {
  const text = { ...defaultLabels, ...labels };
  const used = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const scale = Math.max(used, limit ?? 0);
  const level = levelOf(used, limit);
  const parts = items.filter((item) => item.value > 0);
  const valueText =
    limit === null
      ? formatValue(used)
      : `${formatValue(used)} ${text.of} ${formatValue(limit)}`;
  return (
    <figure
      className={classes("od-chart od-usage-meter", className)}
      data-level={level}
    >
      <figcaption className="od-usage-meter-summary">
        <strong className="od-usage-meter-value">{formatValue(used)}</strong>
        {limit === null ? null : (
          <>
            <span className="od-usage-meter-limit">
              {`${text.of} ${formatValue(limit)}`}
            </span>
            <span className="od-usage-meter-free">
              {level === "full"
                ? text.full
                : text.free(formatValue(limit - used))}
            </span>
          </>
        )}
      </figcaption>
      {/* The native meter gives the value to assistive technology; the bar
          below draws the parts. */}
      <meter
        aria-label={label}
        aria-valuetext={valueText}
        className="od-visually-hidden"
        max={scale === 0 ? 1 : scale}
        min={0}
        value={used}
      />
      <div aria-hidden="true" className="od-usage-meter-track">
        {scale === 0
          ? null
          : parts.map((item) => (
              <span
                className="od-usage-meter-part"
                data-slot={item.slot}
                key={item.id}
                style={
                  {
                    "--od-usage-share": `${String((item.value / scale) * 100)}%`,
                  } as CSSProperties
                }
                title={`${item.label}: ${formatValue(item.value)}`}
              />
            ))}
      </div>
      {legend ? (
        <ul className="od-usage-meter-legend">
          {items.map((item) => (
            <li data-empty={item.value > 0 ? undefined : true} key={item.id}>
              <i className="od-chart-swatch" data-slot={item.slot} />
              <span className="od-chart-name">{item.label}</span>
              <span className="od-usage-meter-detail">{item.detail}</span>
              <span className="od-usage-meter-amount">
                {formatValue(item.value)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
