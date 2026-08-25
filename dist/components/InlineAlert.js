import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function InlineAlert({ actions, children, className, role, title, tone = "info", ...props }) {
    return (_jsxs("div", { ...props, className: ["od-inline-alert", `od-inline-alert-${tone}`, className]
            .filter(Boolean)
            .join(" "), "data-tone": tone, role: role ?? (tone === "error" ? "alert" : undefined), children: [_jsx("span", { className: "od-inline-alert-mark", "aria-hidden": "true" }), _jsxs("div", { className: "od-inline-alert-copy", children: [title ? _jsx("strong", { children: title }) : null, _jsx("div", { children: children })] }), actions ? (_jsx("div", { className: "od-inline-alert-actions", children: actions })) : null] }));
}
//# sourceMappingURL=InlineAlert.js.map