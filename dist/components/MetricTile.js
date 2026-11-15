import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
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
/** One key number with its change from the period before. */
export function MetricTile({ change = null, className, label, points, trend = "flat", value, }) {
    return (_jsxs("div", { className: classes("od-metric", className), "data-trend": trend, children: [_jsx("dt", { className: "od-metric-label", children: label }), _jsxs("dd", { className: "od-metric-value", children: [value, change === null ? null : (_jsx("span", { className: "od-metric-change", "data-trend": trend, children: change }))] }), points === undefined ? null : _jsx(Sparkline, { points: points })] }));
}
//# sourceMappingURL=MetricTile.js.map