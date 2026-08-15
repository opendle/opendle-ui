import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PlanCardShell({ age, ariaLabel, children, className, compact = false, icon, meta, state, title, }) {
    return (_jsxs("article", { "aria-label": ariaLabel, className: ["od-plan-card", "shared-plan-card", className].filter(Boolean).join(" "), "data-compact": compact, "data-state": state, children: [_jsxs("div", { className: "plan-heading", children: [_jsx("span", { children: icon }), _jsxs("div", { children: [_jsx("small", { children: meta }), _jsx("strong", { children: title })] }), _jsx("span", { className: "plan-age", children: age })] }), children] }));
}
//# sourceMappingURL=PlanCardShell.js.map