import {
  useMemo,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { chartSlots } from "./chartScale.js";
import { classes } from "./classes.js";
import { cycleIndex } from "./cycleIndex.js";

export interface DonutChartItem {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  /**
   * The colour slot, from 0, as in `StackedBarChart`. The items with a slot
   * of 9 or more become one neutral item.
   */
  readonly slot: number;
  /** A mark before the name, for example a network icon. */
  readonly icon?: ReactNode;
}

export interface DonutChartProps {
  /** The accessible name, for example the metric. */
  readonly label: string;
  readonly items: readonly DonutChartItem[];
  readonly formatValue?: (value: number) => string;
  /** The value in the centre. The default is the total of the items. */
  readonly total?: ReactNode;
  /** A short caption under the value in the centre. */
  readonly totalLabel?: ReactNode;
  /** The name of the item that holds the items without a colour. */
  readonly otherLabel?: string;
  readonly className?: string;
}

const center = 50;
const radius = 40;
/** The empty angle between two slices, in degrees. */
const gap = 1.6;
/** The smallest angle of a slice, in degrees, so a small share stays visible. */
const minimumAngle = 4;
const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});
const defaultFormat = (value: number) => compact.format(value);
const wholePercent = new Intl.NumberFormat(undefined, { style: "percent" });
const finePercent = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 1,
});

function percent(share: number): string {
  return (share < 0.1 ? finePercent : wholePercent).format(share);
}

/** The items with a value, and one neutral item for those without a colour. */
function foldItems(
  items: readonly DonutChartItem[],
  otherLabel: string,
): readonly DonutChartItem[] {
  const shown = items.filter((item) => item.value > 0);
  const kept = shown.filter((item) => item.slot < chartSlots);
  const rest = shown.filter((item) => item.slot >= chartSlots);
  if (rest.length === 0) return kept;
  const value = rest.reduce((sum, item) => sum + item.value, 0);
  return [...kept, { id: "other", label: otherLabel, slot: chartSlots, value }];
}

/**
 * The angle of each slice. A slice smaller than the minimum gets the minimum
 * and the other slices become smaller. The percentages stay true.
 */
function sliceAngles(values: readonly number[]): readonly number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  const angles = values.map((value) => (value / total) * 360);
  const small = angles.filter((angle) => angle < minimumAngle).length;
  const large = angles
    .filter((angle) => angle >= minimumAngle)
    .reduce((sum, angle) => sum + angle, 0);
  const room = 360 - small * minimumAngle;
  if (small === 0 || room <= 0 || large === 0) return angles;
  return angles.map((angle) =>
    angle < minimumAngle ? minimumAngle : (angle * room) / large,
  );
}

function point(angle: number): string {
  const turn = ((angle - 90) * Math.PI) / 180;
  const x = center + radius * Math.cos(turn);
  const y = center + radius * Math.sin(turn);
  return `${x.toFixed(3)} ${y.toFixed(3)}`;
}

function arc(start: number, end: number): string {
  const large = end - start > 180 ? 1 : 0;
  return `M${point(start)}A${String(radius)} ${String(radius)} 0 ${String(large)} 1 ${point(end)}`;
}

/** The arc of each item, clockwise from the top, with a gap between two. */
function donutSlices(
  items: readonly DonutChartItem[],
): readonly { readonly item: DonutChartItem; readonly d: string }[] {
  const angles = sliceAngles(items.map((item) => item.value));
  let start = 0;
  return items.map((item, index) => {
    const from = start + gap / 2;
    start += angles[index] ?? 0;
    return { item, d: arc(from, Math.max(from + 0.1, start - gap / 2)) };
  });
}

/** The item under the pointer, from the `data-item` of an element. */
function pointed(event: PointerEvent): string | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  return target.closest("[data-item]")?.getAttribute("data-item") ?? null;
}

const arrowSteps: Readonly<Record<string, 1 | -1>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

interface DonutShapesProps {
  readonly shown: readonly DonutChartItem[];
  readonly slices: readonly {
    readonly item: DonutChartItem;
    readonly d: string;
  }[];
  readonly active: string | null;
}

/** An empty track, a full ring for one item, or one arc for each item. */
function DonutShapes({ active, shown, slices }: DonutShapesProps) {
  const [only] = shown;
  if (only === undefined) {
    return (
      <circle className="od-donut-track" cx={center} cy={center} r={radius} />
    );
  }
  if (shown.length === 1) {
    return (
      <circle
        className="od-donut-slice"
        cx={center}
        cy={center}
        data-active={only.id === active}
        data-item={only.id}
        data-slot={only.slot}
        r={radius}
      />
    );
  }
  return slices.map(({ d, item }) => (
    <path
      className="od-donut-slice"
      d={d}
      data-active={item.id === active}
      data-item={item.id}
      data-slot={item.slot}
      key={item.id}
    />
  ));
}

/**
 * The share of each item in a total, as a ring with one slice for each item
 * and a legend with the values and the percentages. A pointer on a slice or
 * on a legend row, or the arrow keys on the ring, mark one item and show its
 * value in the centre. An item keeps the colour of its slot in all charts.
 */
export function DonutChart({
  className,
  formatValue = defaultFormat,
  items,
  label,
  otherLabel = "Other",
  total,
  totalLabel,
}: DonutChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const shown = useMemo(
    () => foldItems(items, otherLabel),
    [items, otherLabel],
  );
  const sum = shown.reduce((value, item) => value + item.value, 0);
  const slices = useMemo(() => donutSlices(shown), [shown]);
  const marked = shown.find((item) => item.id === active);

  const keyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === "Escape") setActive(null);
    const step = arrowSteps[event.key];
    if (step === undefined || shown.length === 0) return;
    event.preventDefault();
    const index = shown.findIndex((item) => item.id === active);
    setActive(shown[cycleIndex(index, shown.length, step)]?.id ?? null);
  };

  return (
    <figure
      className={classes("od-chart od-donut", className)}
      data-active={marked === undefined ? undefined : true}
    >
      <div className="od-donut-body">
        <div className="od-donut-ring">
          {/* react-doctor-disable-next-line react-doctor/no-noninteractive-element-interactions, react-doctor/no-noninteractive-tabindex -- The ring is one keyboard stop: the arrow keys mark an item, as a pointer does. */}
          <svg
            aria-label={`${label}: ${formatValue(sum)}`}
            onBlur={() => {
              setActive(null);
            }}
            onKeyDown={keyDown}
            onPointerLeave={() => {
              setActive(null);
            }}
            onPointerOver={(event) => {
              setActive(pointed(event));
            }}
            role="img"
            tabIndex={0}
            viewBox="0 0 100 100"
          >
            <DonutShapes active={active} shown={shown} slices={slices} />
          </svg>
          <div aria-hidden="true" className="od-donut-center">
            {marked === undefined ? (
              <>
                <strong className="od-donut-value">
                  {total ?? formatValue(sum)}
                </strong>
                {totalLabel === undefined ? null : (
                  <span className="od-donut-caption">{totalLabel}</span>
                )}
              </>
            ) : (
              <>
                <strong className="od-donut-value">
                  {formatValue(marked.value)}
                </strong>
                <span className="od-donut-caption">
                  <span className="od-chart-name">{marked.label}</span>
                  <span>{percent(marked.value / sum)}</span>
                </span>
              </>
            )}
          </div>
        </div>
        {/* react-doctor-disable-next-line react-doctor/no-noninteractive-element-interactions -- A pointer on a legend row marks its slice; the ring gives the same marks to the keyboard. */}
        <ul
          aria-label={label}
          className="od-donut-legend"
          onPointerLeave={() => {
            setActive(null);
          }}
          onPointerOver={(event) => {
            setActive(pointed(event));
          }}
        >
          {shown.map((item) => (
            <li
              data-active={item.id === active}
              data-item={item.id}
              key={item.id}
            >
              <i className="od-chart-swatch" data-slot={item.slot} />
              {item.icon}
              <span className="od-chart-name">{item.label}</span>
              <b className="od-donut-amount">{formatValue(item.value)}</b>
              <span className="od-donut-percent">
                {percent(item.value / sum)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
