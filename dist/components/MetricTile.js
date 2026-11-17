import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children } from "react";
import { classes } from "./classes.js";
import { balancedColumns } from "./metricColumns.js";
const width = 100;
const height = 32;
/** The line keeps this space from the top and the bottom of its box. */
const inset = 3;
/**
 * A smooth path through the points that does not go above or below them
 * between two points (monotone cubic interpolation).
 */
function smoothPath(points) {
    const count = points.length;
    const slopes = points.slice(1).map(([x, y], index) => {
        const [previousX, previousY] = points[index] ?? [x, y];
        return x === previousX ? 0 : (y - previousY) / (x - previousX);
    });
    const tangents = points.map((_, index) => {
        if (index === 0)
            return slopes[0] ?? 0;
        if (index === count - 1)
            return slopes.at(-1) ?? 0;
        const before = slopes[index - 1] ?? 0;
        const after = slopes[index] ?? 0;
        return before * after <= 0 ? 0 : (2 * before * after) / (before + after);
    });
    return points
        .map(([x, y], index) => {
        if (index === 0)
            return `M${String(x)} ${String(y)}`;
        const [previousX, previousY] = points[index - 1] ?? [x, y];
        const step = (x - previousX) / 3;
        const first = previousY + step * (tangents[index - 1] ?? 0);
        const second = y - step * (tangents[index] ?? 0);
        return `C${String(previousX + step)} ${String(first)} ${String(x - step)} ${String(second)} ${String(x)} ${String(y)}`;
    })
        .join("");
}
function Sparkline({ points, }) {
    const known = points.flatMap((value, index) => value === null ? [] : [[index, value]]);
    if (known.length < 2)
        return null;
    const values = known.map(([, value]) => value);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const range = high - low;
    const last = Math.max(1, points.length - 1);
    const placed = known.map(([index, value]) => [
        (index / last) * width,
        range === 0
            ? height / 2
            : inset + (1 - (value - low) / range) * (height - 2 * inset),
    ]);
    const line = smoothPath(placed);
    const startX = placed[0]?.[0] ?? 0;
    const endX = placed.at(-1)?.[0] ?? width;
    return (_jsx("dd", { "aria-hidden": "true", className: "od-metric-spark", children: _jsxs("svg", { preserveAspectRatio: "none", viewBox: `0 0 ${String(width)} ${String(height)}`, children: [_jsx("path", { className: "od-metric-spark-area", d: `${line}L${String(endX)} ${String(height)}L${String(startX)} ${String(height)}Z` }), _jsx("path", { className: "od-metric-spark-line", d: line })] }) }));
}
function SparkBars({ points, }) {
    const values = points.filter((value) => value !== null);
    if (values.length === 0 || points.length < 2)
        return null;
    const high = Math.max(0, ...values);
    const slot = width / points.length;
    const gap = Math.min(slot * 0.3, 4);
    return (_jsx("dd", { "aria-hidden": "true", className: "od-metric-spark", "data-chart": "bars", children: _jsx("svg", { preserveAspectRatio: "none", viewBox: `0 0 ${String(width)} ${String(height)}`, children: points.map((value, index) => {
                // A day without a value, or a zero, keeps a thin mark on the base.
                const size = value === null || high === 0
                    ? 1
                    : Math.max(1.5, (value / high) * (height - inset));
                return (_jsx("rect", { className: value === null ? "od-metric-spark-empty" : "od-metric-spark-bar", height: size, width: slot - gap, x: index * slot + gap / 2, y: height - size }, index));
            }) }) }));
}
/** One key number with its change from the period before. */
export function MetricTile({ change = null, chart = "line", className, label, points, trend = "flat", value, }) {
    return (_jsxs("div", { className: classes("od-metric", className), "data-trend": trend, children: [_jsx("dt", { className: "od-metric-label", children: label }), _jsxs("dd", { className: "od-metric-value", children: [value, change === null ? null : (_jsx("span", { className: "od-metric-change", "data-trend": trend, children: change }))] }), points === undefined ? null : chart === "bars" ? (_jsx(SparkBars, { points: points })) : (_jsx(Sparkline, { points: points }))] }));
}
/**
 * The metric tiles in complete rows: the count of columns follows the width
 * and the count of tiles, and a shorter last row fills all of its width.
 */
export function MetricGrid({ children, className }) {
    const count = Children.toArray(children).length;
    const style = {
        "--od-metric-columns-narrow": balancedColumns(count, 2),
        "--od-metric-columns-medium": balancedColumns(count, 3),
        "--od-metric-columns-wide": balancedColumns(count, 6),
    };
    return (_jsx("dl", { className: classes("od-metric-grid", className), style: style, children: children }));
}
//# sourceMappingURL=MetricTile.js.map