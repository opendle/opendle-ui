import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useRef, useState, } from "react";
// react-doctor-disable-next-line react-doctor/no-flush-sync -- The native modal must close before the host moves focus or the browser follows its link.
import { createPortal, flushSync } from "react-dom";
import { ApplicationNavigation } from "./ApplicationShell.js";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { NavigationLink } from "./NavigationLink.js";
/** A persistent row with optional host-owned destinations and account access. */
export function MobileNavigation({ className, items, onNavigate, onSelect, surface, ...props }) {
    const [mode, setMode] = useState("closed");
    const triggerRef = useRef(null);
    const surfaceId = useId();
    const navigate = (item, event) => {
        if (event.defaultPrevented ||
            event.button !== 0 ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey)
            return;
        // Close the native modal and cancel queued focus return before navigation.
        if (surface !== undefined) {
            flushSync(() => {
                setMode("navigate");
            });
        }
        onNavigate?.(item, event);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { ...props, className: ["od-mobile-navigation", "mobile-navigation", className]
                    .filter(Boolean)
                    .join(" "), children: [items.map((item) => item.href !== undefined ? (_jsx(NavigationLink, { active: item.active ?? false, href: item.href, icon: item.icon, label: item.label, count: item.badge, onClick: (event) => {
                            if (item.href !== undefined)
                                navigate({ ...item, href: item.href }, event);
                        } }, item.id)) : (_jsxs("button", { type: "button", "data-active": item.active ?? false, "aria-label": typeof item.label === "string" ? item.label : undefined, onClick: () => onSelect?.(item.id), children: [item.icon, _jsx("span", { children: item.label }), item.badge !== undefined && item.badge !== null ? (_jsx("i", { children: item.badge })) : null] }, item.id))), surface === undefined ? null : (_jsxs("button", { "aria-controls": surfaceId, "aria-expanded": mode === "open", "aria-haspopup": "dialog", onClick: () => {
                            setMode("open");
                        }, ref: triggerRef, type: "button", children: [surface.icon, _jsx("span", { children: surface.label })] }))] }), surface === undefined || typeof document === "undefined"
                ? null
                : createPortal(_jsx(Dialog, { actions: _jsxs(_Fragment, { children: [surface.accountActions, _jsx(Button, { onClick: () => {
                                    setMode("closed");
                                }, variant: "quiet", children: surface.closeLabel })] }), className: "od-mobile-navigation-surface", description: _jsxs("section", { "aria-label": surface.context.label, children: [_jsx("strong", { children: surface.context.label }), ":", " ", surface.context.value] }), id: surfaceId, onClose: () => {
                        setMode("closed");
                    }, open: mode === "open", restoreFocusOnClose: mode !== "navigate", returnFocusRef: triggerRef, showCloseButton: false, title: surface.applicationName, children: _jsx(ApplicationNavigation, { "aria-label": surface.label, children: surface.items.map((item, index) => (_jsx(NavigationLink, { active: item.active ?? false, count: item.badge, "data-dialog-initial-focus": index === 0 ? "true" : undefined, href: item.href, icon: item.icon, label: item.label, onClick: (event) => {
                                navigate(item, event);
                            } }, item.id))) }) }), document.body)] }));
}
//# sourceMappingURL=MobileNavigation.js.map