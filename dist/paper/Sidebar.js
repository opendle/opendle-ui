import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
const mainId = "pp-main";
/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window and a bottom bar on a phone.
 */
export function SidebarLayout({ account, brandHref = "/", brandMark, brandName, children, className, navigation, navigationLabel, skipLabel, }) {
    return (_jsxs("div", { className: classes("pp-shell", className), children: [_jsx("a", { className: "pp-skip-link", href: `#${mainId}`, children: skipLabel }), _jsxs("aside", { className: "pp-sidebar", children: [_jsxs("a", { className: "pp-sidebar-brand", href: brandHref, children: [brandMark, _jsx("span", { className: "pp-sidebar-brand-name", children: brandName })] }), _jsx("nav", { "aria-label": navigationLabel, className: "pp-sidebar-nav", children: navigation }), account] }), _jsx("main", { className: "pp-main", id: mainId, tabIndex: -1, children: children })] }));
}
export function SidebarItem({ active = false, className, count = 0, icon, label, ...props }) {
    return (_jsxs("a", { ...props, "aria-current": active ? "page" : undefined, className: classes("pp-sidebar-item", className), title: label, children: [icon, _jsx("span", { className: "pp-sidebar-label", children: label }), count > 0 ? _jsx("span", { className: "pp-count", children: count }) : null] }));
}
/** The signed-in person at the end of the sidebar. */
export function SidebarAccount({ active = false, avatar, className, name, ...props }) {
    return (_jsxs("a", { ...props, "aria-current": active ? "page" : undefined, className: classes("pp-sidebar-account", className), title: name, children: [avatar, _jsx("span", { className: "pp-sidebar-label", children: name })] }));
}
//# sourceMappingURL=Sidebar.js.map