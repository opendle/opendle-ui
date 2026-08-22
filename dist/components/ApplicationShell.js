import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, } from "react";
/** A responsive application frame with caller-owned content and controls. */
export function ApplicationShell({ children, className, mainProps, mobileNavigation, sidebar, topbar, ...props }) {
    const { className: mainClassName, ...restMainProps } = mainProps ?? {};
    return (_jsxs("div", { ...props, className: ["od-application-shell", className].filter(Boolean).join(" "), children: [sidebar, _jsxs("div", { className: "od-application-column", children: [topbar, _jsx("main", { ...restMainProps, className: ["od-application-main", mainClassName]
                            .filter(Boolean)
                            .join(" "), children: children })] }), _jsx("div", { className: "od-application-mobile-navigation", children: mobileNavigation })] }));
}
/** A sticky sidebar with slots for host-owned brand, context, and navigation. */
export function ApplicationSidebar({ brand, className, context, footer, navigation, ...props }) {
    return (_jsxs("aside", { ...props, className: ["od-application-sidebar", className]
            .filter(Boolean)
            .join(" "), children: [_jsx("div", { className: "od-application-sidebar-brand", children: brand }), context ? (_jsx("div", { className: "od-application-sidebar-context", children: context })) : null, _jsx("div", { className: "od-application-sidebar-navigation", children: navigation }), footer ? (_jsx("footer", { className: "od-application-sidebar-footer", children: footer })) : null] }));
}
/** A responsive application header with caller-owned title and actions. */
export function ApplicationTopbar({ actions, className, leading, title, ...props }) {
    return (_jsxs("header", { ...props, className: ["od-application-topbar", className].filter(Boolean).join(" "), children: [leading ? (_jsx("div", { className: "od-application-topbar-leading", children: leading })) : null, _jsx("div", { className: "od-application-topbar-title", children: title }), actions ? (_jsx("div", { className: "od-application-topbar-actions", children: actions })) : null] }));
}
/** A scrollable navigation boundary for grouped application destinations. */
export function ApplicationNavigation({ children, className, ...props }) {
    return (_jsx("nav", { ...props, className: ["od-application-navigation", className]
            .filter(Boolean)
            .join(" "), children: children }));
}
/** A labelled group inside the primary application navigation. */
export function ApplicationNavigationGroup({ children, className, label, "aria-labelledby": labelledBy, ...props }) {
    const generatedLabelId = useId();
    return (_jsxs("section", { ...props, "aria-labelledby": labelledBy ?? generatedLabelId, className: ["od-application-navigation-group", className]
            .filter(Boolean)
            .join(" "), children: [_jsx("p", { className: "od-application-navigation-label", id: labelledBy === undefined ? generatedLabelId : undefined, children: label }), _jsx("div", { className: "od-application-navigation-items", children: children })] }));
}
//# sourceMappingURL=ApplicationShell.js.map