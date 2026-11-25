import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** The share of the limit from which the meter shows a warning. */
const highShare = 0.8;
const defaultLabels = {
    of: "of",
    free: (amount) => `${amount} free`,
    full: "Full",
};
const number = new Intl.NumberFormat();
const defaultFormat = (value) => number.format(value);
/** `normal`, `high` from 80 % of the limit, or `full`. */
function levelOf(used, limit) {
    if (limit === null)
        return "normal";
    if (used >= limit)
        return "full";
    return used >= limit * highShare ? "high" : "normal";
}
/**
 * The use of a resource with a limit, for example the storage of an
 * account: the total, the limit and the free amount, one bar with a part for
 * each item, and a legend with the value of each item. From 80 % of the
 * limit the meter shows a warning; at the limit it shows that it is full.
 */
export function UsageMeter({ className, formatValue = defaultFormat, items, label, labels, legend = true, limit = null, }) {
    const text = { ...defaultLabels, ...labels };
    const used = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);
    const scale = Math.max(used, limit ?? 0);
    const level = levelOf(used, limit);
    const parts = items.filter((item) => item.value > 0);
    const valueText = limit === null
        ? formatValue(used)
        : `${formatValue(used)} ${text.of} ${formatValue(limit)}`;
    return (_jsxs("figure", { className: classes("od-chart od-usage-meter", className), "data-level": level, children: [_jsxs("figcaption", { className: "od-usage-meter-summary", children: [_jsx("strong", { className: "od-usage-meter-value", children: formatValue(used) }), limit === null ? null : (_jsxs(_Fragment, { children: [_jsx("span", { className: "od-usage-meter-limit", children: `${text.of} ${formatValue(limit)}` }), _jsx("span", { className: "od-usage-meter-free", children: level === "full"
                                    ? text.full
                                    : text.free(formatValue(limit - used)) })] }))] }), _jsx("meter", { "aria-label": label, "aria-valuetext": valueText, className: "od-visually-hidden", max: scale === 0 ? 1 : scale, min: 0, value: used }), _jsx("div", { "aria-hidden": "true", className: "od-usage-meter-track", children: scale === 0
                    ? null
                    : parts.map((item) => (_jsx("span", { className: "od-usage-meter-part", "data-slot": item.slot, style: {
                            "--od-usage-share": `${String((item.value / scale) * 100)}%`,
                        }, title: `${item.label}: ${formatValue(item.value)}` }, item.id))) }), legend ? (_jsx("ul", { className: "od-usage-meter-legend", children: items.map((item) => (_jsxs("li", { "data-empty": item.value > 0 ? undefined : true, children: [_jsx("i", { className: "od-chart-swatch", "data-slot": item.slot }), _jsx("span", { className: "od-chart-name", children: item.label }), _jsx("span", { className: "od-usage-meter-detail", children: item.detail }), _jsx("span", { className: "od-usage-meter-amount", children: formatValue(item.value) })] }, item.id))) })) : null] }));
}
//# sourceMappingURL=UsageMeter.js.map