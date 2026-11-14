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
//# sourceMappingURL=SidebarLayout.js.map