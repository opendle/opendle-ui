import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, } from "react";
import { chartSlots } from "./chartScale.js";
import { classes } from "./classes.js";
import { cycleIndex } from "./cycleIndex.js";
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
const defaultFormat = (value) => compact.format(value);
const wholePercent = new Intl.NumberFormat(undefined, { style: "percent" });
const finePercent = new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 1,
});
function percent(share) {
    return (share < 0.1 ? finePercent : wholePercent).format(share);
}
/** The items with a value, and one neutral item for those without a colour. */
function foldItems(items, otherLabel) {
    const shown = items.filter((item) => item.value > 0);
    const kept = shown.filter((item) => item.slot < chartSlots);
    const rest = shown.filter((item) => item.slot >= chartSlots);
    if (rest.length === 0)
        return kept;
    const value = rest.reduce((sum, item) => sum + item.value, 0);
    return [...kept, { id: "other", label: otherLabel, slot: chartSlots, value }];
}
/**
 * The angle of each slice. A slice smaller than the minimum gets the minimum
 * and the other slices become smaller. The percentages stay true.
 */
function sliceAngles(values) {
    const total = values.reduce((sum, value) => sum + value, 0);
    const angles = values.map((value) => (value / total) * 360);
    const small = angles.filter((angle) => angle < minimumAngle).length;
    const large = angles
        .filter((angle) => angle >= minimumAngle)
        .reduce((sum, angle) => sum + angle, 0);
    const room = 360 - small * minimumAngle;
    if (small === 0 || room <= 0 || large === 0)
        return angles;
    return angles.map((angle) => angle < minimumAngle ? minimumAngle : (angle * room) / large);
}
function point(angle) {
    const turn = ((angle - 90) * Math.PI) / 180;
    const x = center + radius * Math.cos(turn);
    const y = center + radius * Math.sin(turn);
    return `${x.toFixed(3)} ${y.toFixed(3)}`;
}
function arc(start, end) {
    const large = end - start > 180 ? 1 : 0;
    return `M${point(start)}A${String(radius)} ${String(radius)} 0 ${String(large)} 1 ${point(end)}`;
}
/** The arc of each item, clockwise from the top, with a gap between two. */
function donutSlices(items) {
    const angles = sliceAngles(items.map((item) => item.value));
    let start = 0;
    return items.map((item, index) => {
        const from = start + gap / 2;
        start += angles[index] ?? 0;
        return { item, d: arc(from, Math.max(from + 0.1, start - gap / 2)) };
    });
}
/** The item under the pointer, from the `data-item` of an element. */
function pointed(event) {
    const target = event.target;
    if (!(target instanceof Element))
        return null;
    return target.closest("[data-item]")?.getAttribute("data-item") ?? null;
}
const arrowSteps = {
    ArrowRight: 1,
    ArrowDown: 1,
    ArrowLeft: -1,
    ArrowUp: -1,
};
/** An empty track, a full ring for one item, or one arc for each item. */
function DonutShapes({ active, shown, slices }) {
    const [only] = shown;
    if (only === undefined) {
        return (_jsx("circle", { className: "od-donut-track", cx: center, cy: center, r: radius }));
    }
    if (shown.length === 1) {
        return (_jsx("circle", { className: "od-donut-slice", cx: center, cy: center, "data-active": only.id === active, "data-item": only.id, "data-slot": only.slot, r: radius }));
    }
    return slices.map(({ d, item }) => (_jsx("path", { className: "od-donut-slice", d: d, "data-active": item.id === active, "data-item": item.id, "data-slot": item.slot }, item.id)));
}
/**
 * The share of each item in a total, as a ring with one slice for each item
 * and a legend with the values and the percentages. A pointer on a slice or
 * on a legend row, or the arrow keys on the ring, mark one item and show its
 * value in the centre. An item keeps the colour of its slot in all charts.
 */
export function DonutChart({ className, formatValue = defaultFormat, items, label, otherLabel = "Other", total, totalLabel, }) {
    const [active, setActive] = useState(null);
    const shown = useMemo(() => foldItems(items, otherLabel), [items, otherLabel]);
    const sum = shown.reduce((value, item) => value + item.value, 0);
    const slices = useMemo(() => donutSlices(shown), [shown]);
    const marked = shown.find((item) => item.id === active);
    const keyDown = (event) => {
        if (event.key === "Escape")
            setActive(null);
        const step = arrowSteps[event.key];
        if (step === undefined || shown.length === 0)
            return;
        event.preventDefault();
        const index = shown.findIndex((item) => item.id === active);
        setActive(shown[cycleIndex(index, shown.length, step)]?.id ?? null);
    };
    return (_jsx("figure", { className: classes("od-chart od-donut", className), "data-active": marked === undefined ? undefined : true, children: _jsxs("div", { className: "od-donut-body", children: [_jsxs("div", { className: "od-donut-ring", children: [_jsx("svg", { "aria-label": `${label}: ${formatValue(sum)}`, onBlur: () => {
                                setActive(null);
                            }, onKeyDown: keyDown, onPointerLeave: () => {
                                setActive(null);
                            }, onPointerOver: (event) => {
                                setActive(pointed(event));
                            }, role: "img", tabIndex: 0, viewBox: "0 0 100 100", children: _jsx(DonutShapes, { active: active, shown: shown, slices: slices }) }), _jsx("div", { "aria-hidden": "true", className: "od-donut-center", children: marked === undefined ? (_jsxs(_Fragment, { children: [_jsx("strong", { className: "od-donut-value", children: total ?? formatValue(sum) }), totalLabel === undefined ? null : (_jsx("span", { className: "od-donut-caption", children: totalLabel }))] })) : (_jsxs(_Fragment, { children: [_jsx("strong", { className: "od-donut-value", children: formatValue(marked.value) }), _jsxs("span", { className: "od-donut-caption", children: [_jsx("span", { className: "od-chart-name", children: marked.label }), _jsx("span", { children: percent(marked.value / sum) })] })] })) })] }), _jsx("ul", { "aria-label": label, className: "od-donut-legend", onPointerLeave: () => {
                        setActive(null);
                    }, onPointerOver: (event) => {
                        setActive(pointed(event));
                    }, children: shown.map((item) => (_jsxs("li", { "data-active": item.id === active, "data-item": item.id, children: [_jsx("i", { className: "od-chart-swatch", "data-slot": item.slot }), item.icon, _jsx("span", { className: "od-chart-name", children: item.label }), _jsx("b", { className: "od-donut-amount", children: formatValue(item.value) }), _jsx("span", { className: "od-donut-percent", children: percent(item.value / sum) })] }, item.id))) })] }) }));
}
//# sourceMappingURL=DonutChart.js.map