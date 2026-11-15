import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
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
  /**
   * `bar` (default) for a value of each day, for example the likes of a day.
   * `area` for a level that continues, for example the followers: a day
   * without a value keeps the last known value.
   */
  readonly variant?: "bar" | "area";
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

/** The values to stack: in an area, a missing day keeps the last value. */
function stackValues(
  values: readonly (number | null)[],
  length: number,
  carry: boolean,
): readonly number[] {
  let last = 0;
  return Array.from({ length }, (_, day) => {
    const value = values[day];
    if (value !== null && value !== undefined) last = value;
    return value ?? (carry ? last : 0);
  });
}

function dayDate(day: string): Date {
  const [year = 1970, month = 1, date = 1] = day.split("-").map(Number);
  return new Date(year, month - 1, date, 12);
}

/** The bottom and the top of one series in the stack, for each day. */
interface Stack {
  readonly entry: ChartSeries;
  readonly from: readonly number[];
  readonly to: readonly number[];
}

interface ChartAreasProps {
  readonly stacks: readonly Stack[];
  readonly active: number | null;
  readonly activeSeries: string | null;
  /** The vertical positions of the top of the plot and of the axis. */
  readonly plotTop: number;
  readonly bottom: number;
  readonly center: (day: number) => number;
  readonly y: (value: number) => number;
}

/** The stacked areas, and the marks of the active day. */
function ChartAreas({
  active,
  activeSeries,
  bottom,
  center,
  plotTop,
  stacks,
  y,
}: ChartAreasProps) {
  return (
    <>
      {stacks.map(({ entry, from, to }) => {
        if (!to.some((value, day) => value > (from[day] ?? 0))) return null;
        const line = to
          .map(
            (value, day) =>
              `${day === 0 ? "M" : "L"}${String(center(day))} ${String(y(value))}`,
          )
          .join("");
        const back = from
          .map((value, day) => `L${String(center(day))} ${String(y(value))}`)
          .toReversed()
          .join("");
        return (
          <g
            data-active={entry.id === activeSeries}
            data-slot={entry.slot}
            key={entry.id}
          >
            <path className="od-chart-area" d={`${line}${back}Z`} />
            <path className="od-chart-line" d={line} />
          </g>
        );
      })}
      {active === null ? null : (
        <g>
          <line
            className="od-chart-cursor"
            x1={center(active)}
            x2={center(active)}
            y1={plotTop}
            y2={bottom}
          />
          {stacks.map(({ entry, from, to }) =>
            (to[active] ?? 0) > (from[active] ?? 0) ? (
              <circle
                className="od-chart-point"
                cx={center(active)}
                cy={y(to[active] ?? 0)}
                data-slot={entry.slot}
                key={entry.id}
                r={entry.id === activeSeries ? 4.5 : 3}
              />
            ) : null,
          )}
        </g>
      )}
    </>
  );
}

interface ChartTooltipProps {
  readonly series: readonly ChartSeries[];
  readonly active: number;
  readonly activeSeries: string | null;
  readonly area: boolean;
  /** The day, already formatted. */
  readonly day: string;
  readonly formatValue: (value: number) => string;
  readonly style: CSSProperties;
}

/** The values of the active day. The top of the stack comes first. */
function ChartTooltip({
  active,
  activeSeries,
  area,
  day,
  formatValue,
  series,
  style,
}: ChartTooltipProps) {
  return (
    <div className="od-chart-tooltip" style={style}>
      <strong>{day}</strong>
      {series.toReversed().map((entry) => {
        // An area keeps the last known value on a day without one.
        const value = area
          ? entry.values
              .slice(0, active + 1)
              .findLast((known) => known !== null)
          : entry.values[active];
        return value === null || value === undefined ? null : (
          <span
            className="od-chart-tooltip-row"
            data-active={entry.id === activeSeries}
            key={entry.id}
          >
            <i className="od-chart-key" data-slot={entry.slot} />
            <b>{formatValue(value)}</b>
            <span className="od-chart-name">{entry.label}</span>
          </span>
        );
      })}
    </div>
  );
}

interface ChartTableProps {
  readonly label: string;
  readonly dayLabel: string;
  readonly totalLabel: string;
  readonly days: readonly string[];
  readonly series: readonly ChartSeries[];
  readonly totals: readonly number[];
}

/** All values in a table for assistive technology. */
function ChartTable({
  dayLabel,
  days,
  label,
  series,
  totalLabel,
  totals,
}: ChartTableProps) {
  return (
    <div className="od-visually-hidden">
      <table>
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">{dayLabel}</th>
            {series.map((entry) => (
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
              {series.map((entry) => (
                <td key={entry.id}>{entry.values[index] ?? ""}</td>
              ))}
              <td>{totals[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * One value for each day, stacked by series, as bars or as a continuous area.
 * The legend gives the total of each series, a pointer or the arrow keys give
 * the values of one day, and a table has all values for assistive technology.
 * The series under the pointer is marked in the values of the day.
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
  variant = "bar",
}: StackedBarChartProps) {
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
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
  const area = variant === "area";
  // For each series and day, the bottom and the top of its part of the stack.
  const stacks = useMemo(() => {
    const base = days.map(() => 0);
    return shown.map((entry) => {
      const values = stackValues(entry.values, days.length, area);
      const from = [...base];
      values.forEach((value, day) => {
        base[day] = (base[day] ?? 0) + Math.max(0, value);
      });
      return { entry, from, to: [...base] };
    });
  }, [area, days, shown]);
  const totals = useMemo(
    () => days.map((_, day) => stacks.at(-1)?.to[day] ?? 0),
    [days, stacks],
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

  const center = (index: number) => left + band * index + band / 2;

  const pointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const index = Math.floor((event.clientX - bounds.left - left) / band);
    if (index < 0 || index >= days.length) {
      setActive(null);
      setActiveSeries(null);
      return;
    }
    setActive(index);
    // The value at the height of the pointer gives the series under it.
    const value =
      ((top + plotHeight - (event.clientY - bounds.top)) / plotHeight) * max;
    const under = stacks.find(
      ({ from, to }) =>
        (to[index] ?? 0) > (from[index] ?? 0) &&
        value >= (from[index] ?? 0) &&
        value < (to[index] ?? 0),
    );
    setActiveSeries(under?.entry.id ?? null);
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
    setActiveSeries(null);
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
          data-variant={variant}
          onBlur={() => {
            setActive(null);
            setActiveSeries(null);
          }}
          onKeyDown={keyDown}
          onPointerLeave={() => {
            setActive(null);
            setActiveSeries(null);
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
          {area ? (
            <ChartAreas
              active={active}
              activeSeries={activeSeries}
              bottom={top + plotHeight}
              center={center}
              plotTop={top}
              stacks={stacks}
              y={y}
            />
          ) : null}
          {days.map((day, index) => {
            const x = left + band * index + (band - bar) / 2;
            let base = 0;
            return (
              <g data-active={index === active} key={day}>
                {!area && index === active ? (
                  <rect
                    className="od-chart-band"
                    height={plotHeight}
                    width={band}
                    x={left + band * index}
                    y={top}
                  />
                ) : null}
                {area
                  ? null
                  : shown.map((entry, order) => {
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
                            data-active={entry.id === activeSeries}
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
          <ChartTooltip
            active={active}
            activeSeries={activeSeries}
            area={area}
            day={formats.full.format(dayDate(activeDay))}
            formatValue={formatValue}
            series={shown}
            style={{
              [active > days.length / 2 ? "right" : "left"]:
                active > days.length / 2
                  ? width - left - band * active + 8
                  : left + band * (active + 1) + 8,
            }}
          />
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
      <ChartTable
        dayLabel={dayLabel}
        days={days}
        label={label}
        series={shown}
        totalLabel={totalLabel}
        totals={totals}
      />
    </figure>
  );
}
