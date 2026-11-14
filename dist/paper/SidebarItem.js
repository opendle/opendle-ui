import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
export function SidebarItem({ active = false, className, count = 0, icon, label, ...props }) {
    return (_jsxs("a", { ...props, "aria-current": active ? "page" : undefined, className: classes("pp-sidebar-item", className), title: label, children: [icon, _jsx("span", { className: "pp-sidebar-label", children: label }), count > 0 ? _jsx("span", { className: "pp-count", children: count }) : null] }));
}
//# sourceMappingURL=SidebarItem.js.map