import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useEffectEvent, useId, useRef, useState, } from "react";
import { classes } from "./classes.js";
/**
 * An icon button that opens a non-modal panel next to it. Escape, a press
 * outside, a link in the panel or a move of the focus out of it closes the
 * panel. Escape returns the focus to the button.
 */
export function Popover({ align = "start", children, className, count = 0, countLabel, icon, label, onOpenChange, panelClassName, }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const openChangeRef = useRef(onOpenChange);
    const panelId = useId();
    useEffect(() => {
        openChangeRef.current = onOpenChange;
    }, [onOpenChange]);
    const change = useCallback((value, restoreFocus = false) => {
        setOpen(value);
        openChangeRef.current?.(value);
        if (restoreFocus)
            buttonRef.current?.focus();
    }, []);
    const close = useEffectEvent((restoreFocus) => {
        change(false, restoreFocus);
    });
    useEffect(() => {
        const root = rootRef.current;
        if (!open || root === null)
            return undefined;
        const outside = (event) => {
            if (event.target instanceof Node && !root.contains(event.target)) {
                close(false);
            }
        };
        const escape = (event) => {
            if (event.key !== "Escape")
                return;
            event.preventDefault();
            event.stopPropagation();
            close(true);
        };
        const leave = (event) => {
            const next = event.relatedTarget;
            if (next instanceof Node && !root.contains(next))
                close(false);
        };
        document.addEventListener("pointerdown", outside);
        root.addEventListener("keydown", escape);
        root.addEventListener("focusout", leave);
        return () => {
            document.removeEventListener("pointerdown", outside);
            root.removeEventListener("keydown", escape);
            root.removeEventListener("focusout", leave);
        };
    }, [open]);
    // Focus the panel, and close it after a used link.
    const attachPanel = useCallback((panel) => {
        if (panel === null)
            return undefined;
        panel.focus();
        const follow = (event) => {
            if (event.target instanceof Element &&
                event.target.closest("a[href]") !== null) {
                change(false);
            }
        };
        panel.addEventListener("click", follow);
        return () => {
            panel.removeEventListener("click", follow);
        };
    }, [change]);
    const shown = count > 0;
    const name = shown && countLabel !== undefined ? `${label}, ${countLabel}` : label;
    return (_jsxs("div", { className: classes("od-popover", className), ref: rootRef, children: [_jsxs("button", { "aria-controls": open ? panelId : undefined, "aria-expanded": open, "aria-haspopup": "dialog", "aria-label": name, className: "od-icon-button od-popover-button", onClick: () => {
                    change(!open);
                }, ref: buttonRef, title: label, type: "button", children: [icon, shown ? (_jsx("span", { "aria-hidden": "true", className: "od-count od-popover-count", children: count > 99 ? "99+" : count })) : null] }), open ? (_jsx("dialog", { "aria-label": label, className: classes("od-popover-panel", panelClassName), "data-align": align, id: panelId, open: true, ref: attachPanel, tabIndex: -1, children: children })) : null] }));
}
//# sourceMappingURL=Popover.js.map