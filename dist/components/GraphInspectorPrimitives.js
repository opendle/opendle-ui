import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
export function GraphInspectorFacts({ className, ...props }) {
    return (_jsx("dl", { ...props, className: classes("od-graph-inspector-facts", className) }));
}
export function GraphInspectorFact({ label, value, className, ...props }) {
    return (_jsxs("div", { ...props, className: classes("od-graph-inspector-fact", className), children: [_jsx("dt", { children: label }), _jsx("dd", { children: value })] }));
}
export function GraphInspectorSection({ title, count, children, className, ...props }) {
    const titleId = useId();
    return (_jsxs("section", { ...props, "aria-labelledby": titleId, className: classes("od-graph-inspector-section", className), children: [_jsxs("h3", { id: titleId, children: [title, count === undefined ? null : (_jsx("span", { className: "od-graph-inspector-section-count", children: count }))] }), _jsx("div", { className: "od-graph-inspector-section-content", children: children })] }));
}
export function GraphInspectorRows({ className, ...props }) {
    return (_jsx("ul", { ...props, className: classes("od-graph-inspector-rows", className) }));
}
export function GraphInspectorRow({ label, value, actions, className, ...props }) {
    return (_jsxs("li", { ...props, className: classes("od-graph-inspector-row", className), children: [_jsxs("div", { className: "od-graph-inspector-row-copy", children: [_jsx("strong", { children: label }), value === undefined ? null : _jsx("span", { children: value })] }), actions === undefined ? null : (_jsx("div", { className: "od-graph-inspector-row-actions", children: actions }))] }));
}
export function GraphInspectorNotice({ tone = "neutral", dynamic = false, children, className, ...props }) {
    const stateLabel = tone === "warning" ? "Warning" : tone === "error" ? "Error" : null;
    return (_jsxs("div", { ...props, className: classes("od-graph-inspector-notice", className), "data-tone": tone, role: dynamic && tone === "error" ? "alert" : props.role, children: [stateLabel === null ? null : (_jsxs("strong", { className: "od-graph-inspector-notice-state", children: [stateLabel, ":"] })), _jsx("div", { className: "od-graph-inspector-notice-content", children: children })] }));
}
//# sourceMappingURL=GraphInspectorPrimitives.js.map