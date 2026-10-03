import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export function CapabilityTag({ label, direction, tone = "neutral", description, pressed, onClick, }) {
    const directionLabel = direction
        ? `${direction === "input" ? "Input" : "Output"} ${label}`
        : label;
    const accessibleLabel = description ?? directionLabel;
    const directionIcon = direction ? (_jsx("svg", { "aria-hidden": "true", className: "od-capability-tag-direction", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.75", children: _jsx("path", { d: "M2 8h11M9 4l4 4-4 4" }) })) : null;
    const content = (_jsxs(_Fragment, { children: [direction === "input" ? directionIcon : null, _jsx("span", { children: label }), direction === "output" ? directionIcon : null, description && !direction && !onClick ? (_jsx("span", { "aria-hidden": "true", children: "\u24D8" })) : null] }));
    const attributes = {
        "aria-label": accessibleLabel,
        className: "od-capability-tag",
        "data-direction": direction,
        "data-tone": tone,
        title: description ?? (direction ? directionLabel : undefined),
    };
    return onClick ? (_jsx("button", { ...attributes, "aria-pressed": pressed ?? false, onClick: onClick, type: "button", children: content })) : (_jsx("span", { ...attributes, children: content }));
}
//# sourceMappingURL=CapabilityTag.js.map