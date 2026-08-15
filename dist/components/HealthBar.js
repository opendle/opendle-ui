import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
export function HealthBar({ className, label, tone = "lime", value, valueLabel, ...props }) {
    const labelId = useId();
    const boundedValue = Math.max(0, Math.min(100, value));
    return (_jsxs("div", { ...props, className: ["od-health-bar", className].filter(Boolean).join(" "), children: [_jsxs("div", { className: "od-health-bar-label", children: [_jsx("span", { id: labelId, children: label }), _jsx("strong", { children: valueLabel ?? `${String(boundedValue)}%` })] }), _jsx("div", { className: "od-health-bar-track", role: "progressbar", "aria-labelledby": labelId, "aria-valuenow": boundedValue, "aria-valuemin": 0, "aria-valuemax": 100, children: _jsx("span", { className: `od-health-bar-fill od-health-${tone}`, style: { width: `${String(boundedValue)}%` } }) })] }));
}
//# sourceMappingURL=HealthBar.js.map