import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ContextItem({ icon, iconClassName, label, value, className, }) {
    return (_jsxs("div", { className: ["od-context-item", className].filter(Boolean).join(" "), children: [_jsx("span", { className: ["od-context-icon", iconClassName].filter(Boolean).join(" "), children: icon }), _jsxs("span", { children: [_jsx("small", { children: label }), _jsx("strong", { children: value })] })] }));
}
//# sourceMappingURL=ContextItem.js.map