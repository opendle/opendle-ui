import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** One key number with its change from the period before. */
export function MetricTile({ change = null, className, label, trend = "flat", value, }) {
    return (_jsxs("div", { className: classes("od-metric", className), children: [_jsx("dt", { className: "od-metric-label", children: label }), _jsxs("dd", { className: "od-metric-value", children: [value, change === null ? null : (_jsx("span", { className: "od-metric-change", "data-trend": trend, children: change }))] })] }));
}
//# sourceMappingURL=MetricTile.js.map