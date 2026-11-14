import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** One destination of the application sidebar, as a link. */
export function NavigationLink({ active = false, className, count = 0, icon, label, nested = false, ...props }) {
    return (_jsxs("a", { ...props, "aria-current": active ? "page" : undefined, className: classes("od-navigation-item", className), "data-nested": nested, title: label, children: [icon, _jsx("span", { className: "od-navigation-label", children: label }), count > 0 ? _jsx("span", { className: "od-count", children: count }) : null] }));
}
//# sourceMappingURL=NavigationLink.js.map