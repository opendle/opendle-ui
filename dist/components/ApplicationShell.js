import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
const mainId = "od-main";
/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window and a bottom bar on a phone.
 */
export function ApplicationShell({ account, brandHref = "/", brandMark, brandName, children, className, mainProps, navigation, navigationLabel, skipLabel, ...props }) {
    return (_jsxs("div", { ...props, className: classes("od-application-shell", className), children: [_jsx("a", { className: "od-skip-link", href: `#${mainId}`, children: skipLabel }), _jsxs("aside", { className: "od-application-sidebar", children: [_jsxs("a", { className: "od-application-brand", href: brandHref, children: [brandMark, _jsx("span", { className: "od-application-brand-name", children: brandName })] }), _jsx("nav", { "aria-label": navigationLabel, className: "od-application-navigation", children: navigation }), account] }), _jsx("main", { ...mainProps, className: classes("od-application-main", mainProps?.className), id: mainId, tabIndex: -1, children: children })] }));
}
//# sourceMappingURL=ApplicationShell.js.map