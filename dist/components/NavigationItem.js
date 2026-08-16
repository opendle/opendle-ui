import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function NavigationItem({ active = false, alert = false, className, count, icon, label, type = "button", ...props }) {
    return (_jsxs("button", { ...props, "aria-current": active ? "page" : undefined, className: ["od-navigation-item", className].filter(Boolean).join(" "), "data-active": active, type: type, children: [icon, _jsx("span", { children: label }), count !== undefined && count !== null ? (_jsx("b", { className: alert ? "od-navigation-alert" : undefined, children: count })) : null] }));
}
//# sourceMappingURL=NavigationItem.js.map