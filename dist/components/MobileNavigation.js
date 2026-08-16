import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function MobileNavigation({ className, items, onSelect, ...props }) {
    return (_jsx("nav", { ...props, className: ["od-mobile-navigation", "mobile-navigation", className]
            .filter(Boolean)
            .join(" "), children: items.map((item) => (_jsxs("button", { type: "button", "data-active": item.active ?? false, "aria-label": typeof item.label === "string" ? item.label : undefined, onClick: () => {
                onSelect(item.id);
            }, children: [item.icon, _jsx("span", { children: item.label }), item.badge !== undefined && item.badge !== null ? (_jsx("i", { children: item.badge })) : null] }, item.id))) }));
}
//# sourceMappingURL=MobileNavigation.js.map