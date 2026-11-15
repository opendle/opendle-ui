import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** One legend for several charts that show the same series. */
export function ChartLegend({ className, items, label }) {
    return (_jsx("ul", { "aria-label": label, className: classes("od-chart od-chart-legend od-chart-key-list", className), children: items.map((item) => (_jsxs("li", { children: [_jsx("i", { className: "od-chart-swatch", "data-slot": item.slot }), item.icon, _jsx("span", { className: "od-chart-name", children: item.label })] }, item.id))) }));
}
//# sourceMappingURL=ChartLegend.js.map