import {
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { chartTicks, foldSeries, type ChartSeries } from "./chartScale.js";
import { classes } from "./classes.js";

export interface StackedBarChartProps {
  /** The accessible name, for example the metric. */
  readonly label: string;
  /** The `YYYY-MM-DD` days of the horizontal axis. */
  readonly days: readonly string[];
  readonly series: readonly ChartSeries[];
  readonly formatValue?: (value: number) => string;
  /** The name of the series that holds the series without a colour. */
  readonly otherLabel?: string;
  readonly totalLabel?: string;
  readonly dayLabel?: string;
  readonly locale?: string;
  readonly height?: number;
  /** Set false when one legend of the page names the series. */
  readonly legend?: boolean;
  readonly className?: string;
}

const left = 44;
const top = 8;
const bottom = 22;
/** A segment of this height or more has a line between it and the next. */
const separatorHeight = 6;
const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});
const defaultFormat = (value: number) => compact.format(value);

function dayDate(day: string): Date {
  const [year = 1970, month = 1, date = 1] = day.split("-").map(Number);
  return new Date(year, month - 1, date, 12);
}

/**
 * One value for each day, stacked by series. The legend gives the total of
 * each series, a pointer or the arrow keys give the values of one day, and a
 * table has all values for assistive technology.
 */
export function StackedBarChart({
  className,
  dayLabel = "Day",
  days,
  formatValue = defaultFormat,
  height = 200,
  label,
  legend = true,
  locale,
  otherLabel = "Other",
  series,
  totalLabel = "Total",
}: StackedBarChartProps) {
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const measure = useCallback((plot: HTMLDivElement | null) => {
    if (plot === null || typeof ResizeObserver === "undefined")
      return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(240, Math.round(entry.contentRect.width)));
    });
    observer.observe(plot);
    return () => {
      observer.disconnect();
    };
  }, []);

  const shown = useMemo(
    () => foldSeries(series, otherLabel),
    [otherLabel, series],
  );
  const formats = useMemo(
    () => ({
      axis: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }),
      full: new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }),
    [locale],
  );
  const totals = useMemo(
    () =>
      days.map((_, day) =>
        shown.reduce((sum, entry) => sum + (entry.values[day] ?? 0), 0),
      ),
    [days, shown],
  );
  const ticks = chartTicks(Math.max(0, ...totals));
  const max = ticks.at(-1) ?? 1;
  const plotWidth = width - left;
  const plotHeight = height - top - bottom;
  const band = days.length === 0 ? plotWidth : plotWidth / days.length;
  const bar = Math.max(2, Math.min(28, band - (band > 8 ? 4 : 1)));
  const y = (value: number) => top + plotHeight - (value / max) * plotHeight;
  const labelEvery = Math.max(
    1,
    Math.ceil(days.length / Math.floor(plotWidth / 72)),
  );

  const pointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const index = Math.floor((event.clientX - bounds.left - left) / band);
    setActive(index >= 0 && index < days.length ? index : null);
  };
  const keyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const last = days.length - 1;
    const next =
      event.key === "ArrowRight"
        ? Math.min(last, (active ?? -1) + 1)
        : event.key === "ArrowLeft"
          ? Math.max(0, (active ?? days.length) - 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (event.key === "Escape") setActive(null);
    if (next === null || last < 0) return;
    event.preventDefault();
    setActive(next);
  };

  const activeDay = active === null ? undefined : days[active];
  return (
    <figure className={classes("od-chart", className)}>
      <div className="od-chart-plot" ref={measure}>
        {/* react-doctor-disable-next-line react-doctor/no-noninteractive-element-interactions, react-doctor/no-noninteractive-tabindex -- The plot is one keyboard stop: the arrow keys move the day, as a pointer does. */}
        <svg
          aria-label={label}
          height={height}
          onBlur={() => {
            setActive(null);
          }}
          onKeyDown={keyDown}
          onPointerLeave={() => {
            setActive(null);
          }}
          onPointerMove={pointer}
          role="img"
          tabIndex={0}
          viewBox={`0 0 ${String(width)} ${String(height)}`}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className={tick === 0 ? "od-chart-axis" : "od-chart-grid"}
                x1={left}
                x2={width}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text
                className="od-chart-tick"
                dy="0.32em"
                textAnchor="end"
                x={left - 8}
                y={y(tick)}
              >
                {formatValue(tick)}
              </text>
            </g>
          ))}
          {days.map((day, index) => {
            const x = left + band * index + (band - bar) / 2;
            let base = 0;
            return (
              <g data-active={index === active} key={day}>
                {index === active ? (
                  <rect
                    className="od-chart-band"
                    height={plotHeight}
                    width={band}
                    x={left + band * index}
                    y={top}
                  />
                ) : null}
                {shown.map((entry, order) => {
                  const value = entry.values[index] ?? 0;
                  if (value <= 0) return null;
                  const from = y(base);
                  base += value;
                  const to = y(base);
                  const size = from - to;
                  const last = !shown.some(
                    (later, place) =>
                      place > order && (later.values[index] ?? 0) > 0,
                  );
                  // Only the top of the complete bar is round.
                  const radius = last ? Math.min(3, bar / 2, size) : 0;
                  return (
                    <g key={entry.id}>
                      <path
                        className="od-chart-bar"
                        d={`M${String(x)} ${String(from)}V${String(to + radius)}Q${String(x)} ${String(to)} ${String(x + radius)} ${String(to)}H${String(x + bar - radius)}Q${String(x + bar)} ${String(to)} ${String(x + bar)} ${String(to + radius)}V${String(from)}Z`}
                        data-slot={entry.slot}
                        data-top={last}
                      />
                      {last || size < separatorHeight ? null : (
                        <line
                          className="od-chart-separator"
                          x1={x}
                          x2={x + bar}
                          y1={to}
                          y2={to}
                        />
                      )}
                    </g>
                  );
                })}
                {index % labelEvery === 0 ? (
                  <text
                    className="od-chart-tick"
                    textAnchor="middle"
                    x={left + band * index + band / 2}
                    y={height - 5}
                  >
                    {formats.axis.format(dayDate(day))}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        {active === null || activeDay === undefined ? null : (
          <div
            className="od-chart-tooltip"
            data-side={active > days.length / 2 ? "left" : "right"}
            style={{
              [active > days.length / 2 ? "right" : "left"]:
                active > days.length / 2
                  ? width - left - band * active + 8
                  : left + band * (active + 1) + 8,
            }}
          >
            <strong>{formats.full.format(dayDate(activeDay))}</strong>
            {shown.map((entry) => {
              const value = entry.values[active];
              return value === null || value === undefined ? null : (
                <span className="od-chart-tooltip-row" key={entry.id}>
                  <i className="od-chart-key" data-slot={entry.slot} />
                  <b>{formatValue(value)}</b>
                  <span className="od-chart-name">{entry.label}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
      {!legend || shown.length < 2 ? null : (
        <figcaption className="od-chart-legend">
          {shown.map((entry) => (
            <span key={entry.id}>
              <i className="od-chart-swatch" data-slot={entry.slot} />
              <span className="od-chart-name">{entry.label}</span>
              {entry.total === undefined ? null : <b>{entry.total}</b>}
            </span>
          ))}
        </figcaption>
      )}
      <div className="od-visually-hidden">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">{dayLabel}</th>
              {shown.map((entry) => (
                <th key={entry.id} scope="col">
                  {entry.label}
                </th>
              ))}
              <th scope="col">{totalLabel}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => (
              <tr key={day}>
                <th scope="row">{day}</th>
                {shown.map((entry) => (
                  <td key={entry.id}>{entry.values[index] ?? ""}</td>
                ))}
                <td>{totals[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
