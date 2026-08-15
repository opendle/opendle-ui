import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function NavigationLink({ active = false, className, count, icon, label, ...props }) {
    return (_jsxs("a", { ...props, "aria-current": active ? "page" : undefined, className: ["od-navigation-item", className].filter(Boolean).join(" "), "data-active": active, children: [icon, _jsx("span", { children: label }), count !== undefined && count !== null ? _jsx("b", { children: count }) : null] }));
}
//# sourceMappingURL=NavigationLink.js.map