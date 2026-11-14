import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** One destination of the application sidebar, as a button. */
export function NavigationItem({ active = false, className, count = 0, icon, label, type = "button", ...props }) {
    return (_jsxs("button", { ...props, "aria-current": active ? "page" : undefined, className: classes("od-navigation-item", className), title: label, type: type, children: [icon, _jsx("span", { className: "od-navigation-label", children: label }), count > 0 ? _jsx("span", { className: "od-count", children: count }) : null] }));
}
//# sourceMappingURL=NavigationItem.js.map