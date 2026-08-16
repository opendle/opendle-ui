import { jsx as _jsx } from "react/jsx-runtime";
export function StatusDot({ tone = "green", className, ...props }) {
    return (_jsx("span", { ...props, "aria-hidden": props["aria-label"] ? undefined : true, className: ["od-status-dot", `od-status-${tone}`, className]
            .filter(Boolean)
            .join(" ") }));
}
//# sourceMappingURL=StatusDot.js.map