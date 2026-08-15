import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Toast({ children, className, onDismiss, ...props }) {
    return (_jsxs("output", { ...props, className: ["od-toast", className].filter(Boolean).join(" "), role: "status", children: [_jsx("span", { children: children }), onDismiss ? _jsx("button", { type: "button", "aria-label": "Dismiss message", onClick: onDismiss, children: "\u00D7" }) : null] }));
}
//# sourceMappingURL=Toast.js.map