import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useState, } from "react";
import { chartTicks, foldSeries } from "./chartScale.js";
import { classes } from "./classes.js";
const left = 44;
const top = 8;
const bottom = 22;
/** A segment of this height or more has a line between it and the next. */
const separatorHeight = 6;
const compact = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
});
const defaultFormat = (value) => compact.format(value);
/** The values to stack: in an area, a missing day keeps the last value. */
function stackValues(values, length, carry) {
    let last = 0;
    return Array.from({ length }, (_, day) => {
        const value = values[day];
        if (value !== null && value !== undefined)
            last = value;
        return value ?? (carry ? last : 0);
    });
}
function dayDate(day) {
    const [year = 1970, month = 1, date = 1] = day.split("-").map(Number);
    return new Date(year, month - 1, date, 12);
}
/** The stacked areas, and the marks of the active day. */
function ChartAreas({ active, activeSeries, bottom, center, plotTop, stacks, y, }) {
    return (_jsxs(_Fragment, { children: [stacks.map(({ entry, from, to }) => {
                if (!to.some((value, day) => value > (from[day] ?? 0)))
                    return null;
                const line = to
                    .map((value, day) => `${day === 0 ? "M" : "L"}${String(center(day))} ${String(y(value))}`)
                    .join("");
                const back = from
                    .map((value, day) => `L${String(center(day))} ${String(y(value))}`)
                    .toReversed()
                    .join("");
                return (_jsxs("g", { "data-active": entry.id === activeSeries, "data-slot": entry.slot, children: [_jsx("path", { className: "od-chart-area", d: `${line}${back}Z` }), _jsx("path", { className: "od-chart-line", d: line })] }, entry.id));
            }), active === null ? null : (_jsxs("g", { children: [_jsx("line", { className: "od-chart-cursor", x1: center(active), x2: center(active), y1: plotTop, y2: bottom }), stacks.map(({ entry, from, to }) => (to[active] ?? 0) > (from[active] ?? 0) ? (_jsx("circle", { className: "od-chart-point", cx: center(active), cy: y(to[active] ?? 0), "data-slot": entry.slot, r: entry.id === activeSeries ? 4.5 : 3 }, entry.id)) : null)] }))] }));
}
/** The values of the active day. The top of the stack comes first. */
function ChartTooltip({ active, activeSeries, area, day, formatValue, series, style, }) {
    return (_jsxs("div", { className: "od-chart-tooltip", style: style, children: [_jsx("strong", { children: day }), series.toReversed().map((entry) => {
                // An area keeps the last known value on a day without one.
                const value = area
                    ? entry.values
                        .slice(0, active + 1)
                        .findLast((known) => known !== null)
                    : entry.values[active];
                return value === null || value === undefined ? null : (_jsxs("span", { className: "od-chart-tooltip-row", "data-active": entry.id === activeSeries, children: [_jsx("i", { className: "od-chart-key", "data-slot": entry.slot }), _jsx("b", { children: formatValue(value) }), _jsx("span", { className: "od-chart-name", children: entry.label })] }, entry.id));
            })] }));
}
/** All values in a table for assistive technology. */
function ChartTable({ dayLabel, days, label, series, totalLabel, totals, }) {
    return (_jsx("div", { className: "od-visually-hidden", children: _jsxs("table", { children: [_jsx("caption", { children: label }), _jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: dayLabel }), series.map((entry) => (_jsx("th", { scope: "col", children: entry.label }, entry.id))), _jsx("th", { scope: "col", children: totalLabel })] }) }), _jsx("tbody", { children: days.map((day, index) => (_jsxs("tr", { children: [_jsx("th", { scope: "row", children: day }), series.map((entry) => (_jsx("td", { children: entry.values[index] ?? "" }, entry.id))), _jsx("td", { children: totals[index] })] }, day))) })] }) }));
}
/**
 * One value for each day, stacked by series, as bars or as a continuous area.
 * The legend gives the total of each series, a pointer or the arrow keys give
 * the values of one day, and a table has all values for assistive technology.
 * The series under the pointer is marked in the values of the day.
 */
export function StackedBarChart({ className, dayLabel = "Day", days, formatValue = defaultFormat, height = 200, label, legend = true, locale, otherLabel = "Other", series, totalLabel = "Total", variant = "bar", }) {
    const [width, setWidth] = useState(640);
    const [active, setActive] = useState(null);
    const [activeSeries, setActiveSeries] = useState(null);
    const measure = useCallback((plot) => {
        if (plot === null || typeof ResizeObserver === "undefined")
            return undefined;
        const observer = new ResizeObserver(([entry]) => {
            if (entry)
                setWidth(Math.max(240, Math.round(entry.contentRect.width)));
        });
        observer.observe(plot);
        return () => {
            observer.disconnect();
        };
    }, []);
    const shown = useMemo(() => foldSeries(series, otherLabel), [otherLabel, series]);
    const formats = useMemo(() => ({
        axis: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }),
        full: new Intl.DateTimeFormat(locale, {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
    }), [locale]);
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
    const totals = useMemo(() => days.map((_, day) => stacks.at(-1)?.to[day] ?? 0), [days, stacks]);
    const ticks = chartTicks(Math.max(0, ...totals));
    const max = ticks.at(-1) ?? 1;
    const plotWidth = width - left;
    const plotHeight = height - top - bottom;
    const band = days.length === 0 ? plotWidth : plotWidth / days.length;
    const bar = Math.max(2, Math.min(28, band - (band > 8 ? 4 : 1)));
    const y = (value) => top + plotHeight - (value / max) * plotHeight;
    const labelEvery = Math.max(1, Math.ceil(days.length / Math.floor(plotWidth / 72)));
    const center = (index) => left + band * index + band / 2;
    const pointer = (event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const index = Math.floor((event.clientX - bounds.left - left) / band);
        if (index < 0 || index >= days.length) {
            setActive(null);
            setActiveSeries(null);
            return;
        }
        setActive(index);
        // The value at the height of the pointer gives the series under it.
        const value = ((top + plotHeight - (event.clientY - bounds.top)) / plotHeight) * max;
        const under = stacks.find(({ from, to }) => (to[index] ?? 0) > (from[index] ?? 0) &&
            value >= (from[index] ?? 0) &&
            value < (to[index] ?? 0));
        setActiveSeries(under?.entry.id ?? null);
    };
    const keyDown = (event) => {
        const last = days.length - 1;
        const next = event.key === "ArrowRight"
            ? Math.min(last, (active ?? -1) + 1)
            : event.key === "ArrowLeft"
                ? Math.max(0, (active ?? days.length) - 1)
                : event.key === "Home"
                    ? 0
                    : event.key === "End"
                        ? last
                        : null;
        if (event.key === "Escape")
            setActive(null);
        if (next === null || last < 0)
            return;
        event.preventDefault();
        setActiveSeries(null);
        setActive(next);
    };
    const activeDay = active === null ? undefined : days[active];
    return (_jsxs("figure", { className: classes("od-chart", className), children: [_jsxs("div", { className: "od-chart-plot", ref: measure, children: [_jsxs("svg", { "aria-label": label, height: height, "data-variant": variant, onBlur: () => {
                            setActive(null);
                            setActiveSeries(null);
                        }, onKeyDown: keyDown, onPointerLeave: () => {
                            setActive(null);
                            setActiveSeries(null);
                        }, onPointerMove: pointer, role: "img", tabIndex: 0, viewBox: `0 0 ${String(width)} ${String(height)}`, children: [ticks.map((tick) => (_jsxs("g", { children: [_jsx("line", { className: tick === 0 ? "od-chart-axis" : "od-chart-grid", x1: left, x2: width, y1: y(tick), y2: y(tick) }), _jsx("text", { className: "od-chart-tick", dy: "0.32em", textAnchor: "end", x: left - 8, y: y(tick), children: formatValue(tick) })] }, tick))), area ? (_jsx(ChartAreas, { active: active, activeSeries: activeSeries, bottom: top + plotHeight, center: center, plotTop: top, stacks: stacks, y: y })) : null, days.map((day, index) => {
                                const x = left + band * index + (band - bar) / 2;
                                let base = 0;
                                return (_jsxs("g", { "data-active": index === active, children: [!area && index === active ? (_jsx("rect", { className: "od-chart-band", height: plotHeight, width: band, x: left + band * index, y: top })) : null, area
                                            ? null
                                            : shown.map((entry, order) => {
                                                const value = entry.values[index] ?? 0;
                                                if (value <= 0)
                                                    return null;
                                                const from = y(base);
                                                base += value;
                                                const to = y(base);
                                                const size = from - to;
                                                const last = !shown.some((later, place) => place > order && (later.values[index] ?? 0) > 0);
                                                // Only the top of the complete bar is round.
                                                const radius = last ? Math.min(3, bar / 2, size) : 0;
                                                return (_jsxs("g", { children: [_jsx("path", { className: "od-chart-bar", "data-active": entry.id === activeSeries, d: `M${String(x)} ${String(from)}V${String(to + radius)}Q${String(x)} ${String(to)} ${String(x + radius)} ${String(to)}H${String(x + bar - radius)}Q${String(x + bar)} ${String(to)} ${String(x + bar)} ${String(to + radius)}V${String(from)}Z`, "data-slot": entry.slot, "data-top": last }), last || size < separatorHeight ? null : (_jsx("line", { className: "od-chart-separator", x1: x, x2: x + bar, y1: to, y2: to }))] }, entry.id));
                                            }), index % labelEvery === 0 ? (_jsx("text", { className: "od-chart-tick", textAnchor: "middle", x: left + band * index + band / 2, y: height - 5, children: formats.axis.format(dayDate(day)) })) : null] }, day));
                            })] }), active === null || activeDay === undefined ? null : (_jsx(ChartTooltip, { active: active, activeSeries: activeSeries, area: area, day: formats.full.format(dayDate(activeDay)), formatValue: formatValue, series: shown, style: {
                            [active > days.length / 2 ? "right" : "left"]: active > days.length / 2
                                ? width - left - band * active + 8
                                : left + band * (active + 1) + 8,
                        } }))] }), !legend || shown.length < 2 ? null : (_jsx("figcaption", { className: "od-chart-legend", children: shown.map((entry) => (_jsxs("span", { children: [_jsx("i", { className: "od-chart-swatch", "data-slot": entry.slot }), _jsx("span", { className: "od-chart-name", children: entry.label }), entry.total === undefined ? null : _jsx("b", { children: entry.total })] }, entry.id))) })), _jsx(ChartTable, { dayLabel: dayLabel, days: days, label: label, series: shown, totalLabel: totalLabel, totals: totals })] }));
}
//# sourceMappingURL=StackedBarChart.js.map