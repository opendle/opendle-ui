import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSyncExternalStore, } from "react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { Panel, PanelHeader } from "./Panel.js";
const phoneLayoutQuery = "(max-width: 48rem)";
function subscribeToPhoneLayout(onChange) {
    if (typeof window === "undefined" || !("matchMedia" in window))
        return () => undefined;
    const query = window.matchMedia(phoneLayoutQuery);
    query.addEventListener("change", onChange);
    return () => {
        query.removeEventListener("change", onChange);
    };
}
function readPhoneLayout() {
    return (typeof window !== "undefined" &&
        "matchMedia" in window &&
        window.matchMedia(phoneLayoutQuery).matches);
}
function readServerPhoneLayout() {
    return false;
}
function canReceiveFocus(target) {
    return Boolean(target?.isConnected &&
        !target.matches(":disabled") &&
        target.closest("[inert]") === null);
}
function resolveReturnFocus(panel) {
    const opener = panel.openerRef?.current;
    if (canReceiveFocus(opener))
        return opener;
    const fallback = panel.fallbackFocusRef?.current;
    return canReceiveFocus(fallback) ? fallback : null;
}
function restorePanelFocus(panel) {
    const apply = () => {
        const target = resolveReturnFocus(panel);
        if (target === null)
            return;
        const active = document.activeElement;
        const activeDialog = active instanceof HTMLElement
            ? active.closest("dialog[open]")
            : null;
        if (activeDialog !== null && !activeDialog.contains(target))
            return;
        target.focus({ preventScroll: true });
    };
    if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(() => requestAnimationFrame(apply));
    else
        apply();
}
function panelStyle(width) {
    return width === undefined ? undefined : { width };
}
function DockedPanelSurface({ panel, position, requestClose, }) {
    const closeLabel = panel.closeLabel ?? `Close ${panel.title}`;
    const handleKeyDown = (event) => {
        if (event.defaultPrevented || event.key !== "Escape")
            return;
        event.preventDefault();
        event.stopPropagation();
        requestClose(panel);
    };
    return (_jsxs(Panel, { "aria-label": panel.title, className: "od-docked-panel", "data-position": position, onKeyDown: handleKeyDown, role: "complementary", style: panelStyle(panel.width), children: [_jsx(PanelHeader, { actions: _jsx(Button, { "aria-label": closeLabel, className: "od-docked-panel-close", onClick: () => {
                        requestClose(panel);
                    }, type: "button", variant: "quiet", children: _jsx("span", { "aria-hidden": "true", children: "\u00D7" }) }), title: panel.title }), _jsx("div", { className: "od-docked-panel-content", children: panel.children })] }));
}
function selectPhonePanel(activeSheet, innerPanel, outerPanel) {
    if (activeSheet === null)
        return null;
    if (activeSheet === "inner" && innerPanel?.open)
        return { panel: innerPanel, position: "inner" };
    if (activeSheet === "outer" && outerPanel?.open)
        return { panel: outerPanel, position: "outer" };
    if (outerPanel?.open)
        return { panel: outerPanel, position: "outer" };
    if (innerPanel?.open)
        return { panel: innerPanel, position: "inner" };
    return null;
}
/**
 * A full-height workspace with two ordered end docks and one phone sheet.
 * The host owns panel state and selects the active phone sheet.
 */
export function DockedPanelLayout({ activeSheet, children, className, innerPanel, outerPanel, ...props }) {
    const phoneLayout = useSyncExternalStore(subscribeToPhoneLayout, readPhoneLayout, readServerPhoneLayout);
    const requestClose = (panel) => {
        panel.onClose();
        restorePanelFocus(panel);
    };
    const phoneSelection = phoneLayout
        ? selectPhonePanel(activeSheet, innerPanel, outerPanel)
        : null;
    const phonePanel = phoneSelection?.panel;
    return (_jsxs("div", { ...props, className: ["od-docked-panel-layout", className]
            .filter(Boolean)
            .join(" "), children: [_jsx("div", { className: "od-docked-panel-layout-workspace", children: children }), !phoneLayout && innerPanel?.open ? (_jsx(DockedPanelSurface, { panel: innerPanel, position: "inner", requestClose: requestClose })) : null, !phoneLayout && outerPanel?.open ? (_jsx(DockedPanelSurface, { panel: outerPanel, position: "outer", requestClose: requestClose })) : null, phoneLayout && phonePanel ? (_jsx(Dialog, { bodyClassName: "od-docked-panel-sheet-content", className: "od-docked-panel-sheet", closeLabel: phonePanel.closeLabel ?? `Close ${phonePanel.title}`, onClose: () => {
                    requestClose(phonePanel);
                }, open: true, title: phonePanel.title, children: phonePanel.children }, phoneSelection.position)) : null] }));
}
//# sourceMappingURL=DockedPanelLayout.js.map