import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState, } from "react";
import { classes } from "./classes.js";
import { Dialog } from "./Dialog.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { NavigationItem } from "./NavigationItem.js";
const mainId = "od-main";
const listIcon = _jsx(Icon, { name: "layers" });
const panelIcon = _jsx(Icon, { name: "panel-left" });
/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window, or when the user collapses it, and a bottom bar on a phone.
 */
export function ApplicationShell({ account, brandHref = "/", brandMark, brandName, children, className, closeLabel = "Close", collapsed = false, collapseLabel = "Collapse the sidebar", expandLabel = "Expand the sidebar", mainProps, navigation, navigationLabel, onCollapsedChange, secondaryNavigation, secondaryNavigationLabel = "", skipLabel, workspace, ...props }) {
    const [listOpen, setListOpen] = useState(false);
    // A used link of the sheet closes the sheet.
    const closeAfterLink = useCallback((list) => {
        if (list === null)
            return undefined;
        const close = (event) => {
            if (event.target instanceof Element && event.target.closest("a")) {
                setListOpen(false);
            }
        };
        list.addEventListener("click", close);
        return () => {
            list.removeEventListener("click", close);
        };
    }, []);
    const hasSecondary = secondaryNavigation !== undefined && secondaryNavigation !== null;
    return (_jsxs("div", { ...props, className: classes("od-application-shell", className), "data-collapsed": collapsed, children: [_jsx("a", { className: "od-skip-link", href: `#${mainId}`, children: skipLabel }), _jsxs("aside", { className: "od-application-sidebar", children: [_jsxs("a", { className: "od-application-brand", href: brandHref, children: [brandMark, _jsx("span", { className: "od-application-brand-name", children: brandName })] }), workspace === undefined || workspace === null ? null : (_jsx("div", { className: "od-application-workspace", children: workspace })), _jsxs("nav", { "aria-label": navigationLabel, className: "od-application-navigation", children: [navigation, hasSecondary ? (_jsx(NavigationItem, { className: "od-application-list-button", icon: listIcon, label: secondaryNavigationLabel, onClick: () => {
                                    setListOpen(true);
                                } })) : null] }), hasSecondary ? (_jsx("nav", { "aria-label": secondaryNavigationLabel, className: "od-application-navigation od-application-secondary", children: secondaryNavigation })) : null, _jsxs("div", { className: "od-application-footer", children: [account, onCollapsedChange === undefined ? null : (_jsx(IconButton, { "aria-pressed": collapsed, className: "od-application-collapse", icon: panelIcon, label: collapsed ? expandLabel : collapseLabel, onClick: () => {
                                    onCollapsedChange(!collapsed);
                                } }))] })] }), _jsx("main", { ...mainProps, className: classes("od-application-main", mainProps?.className), id: mainId, tabIndex: -1, children: children }), hasSecondary ? (_jsx(Dialog, { bodyClassName: "od-application-list-body", className: "od-application-list", closeLabel: closeLabel, onClose: () => {
                    setListOpen(false);
                }, open: listOpen, size: "narrow", title: secondaryNavigationLabel, children: _jsx("nav", { "aria-label": secondaryNavigationLabel, className: "od-application-navigation", ref: closeAfterLink, children: secondaryNavigation }) })) : null] }));
}
//# sourceMappingURL=ApplicationShell.js.map