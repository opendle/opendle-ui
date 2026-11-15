import type { ReactNode } from "react";

import { classes } from "./classes.js";

export interface ChartLegendItem {
  readonly id: string;
  readonly label: string;
  /** The colour slot of the series in the charts. */
  readonly slot: number;
  /** A mark before the name, for example a network icon. */
  readonly icon?: ReactNode;
}

export interface ChartLegendProps {
  /** The accessible name of the list. */
  readonly label: string;
  readonly items: readonly ChartLegendItem[];
  readonly className?: string;
}

/** One legend for several charts that show the same series. */
export function ChartLegend({ className, items, label }: ChartLegendProps) {
  return (
    <ul
      aria-label={label}
      className={classes(
        "od-chart od-chart-legend od-chart-key-list",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id}>
          <i className="od-chart-swatch" data-slot={item.slot} />
          {item.icon}
          <span className="od-chart-name">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
