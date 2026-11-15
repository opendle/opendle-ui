import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** One destination of the application sidebar, as a link. */
export function NavigationLink({ active = false, className, count = 0, icon, label, nested = false, ...props }) {
    return (_jsxs("a", { ...props, "aria-current": active ? "page" : undefined, className: classes("od-navigation-item", className), "data-nested": nested, title: label, children: [icon, _jsx("span", { className: "od-navigation-label", children: label }), count > 0 ? _jsx("span", { className: "od-count", children: count }) : null] }));
}
/** Keep a parent destination and its open child destinations in one frame. */
export function NavigationGroup({ children, nested, active = false, }) {
    return (_jsxs("div", { className: "od-navigation-group", "data-active": active, children: [children, nested == null ? null : (_jsx("div", { className: "od-navigation-group-children", children: nested }))] }));
}
//# sourceMappingURL=NavigationLink.js.map