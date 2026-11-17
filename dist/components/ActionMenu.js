import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { placePanel } from "./placePanel.js";
const itemSelector = '[role="menuitem"]';
/**
 * A "more actions" button that opens a short menu of actions for one object.
 * The arrow keys, Home and End move in the menu. Escape closes it and returns
 * the focus to the button. A press outside or Tab closes it.
 */
export function ActionMenu({ align = "end", className, disabled = false, icon, items, label, }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const menuId = useId();
    useLayoutEffect(() => {
        const button = buttonRef.current;
        const menu = menuRef.current;
        if (!open || button === null || menu === null)
            return undefined;
        const update = () => {
            placePanel(button, menu, align);
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [align, open]);
    useEffect(() => {
        if (!open)
            return undefined;
        const outside = (event) => {
            if (event.target instanceof Node &&
                rootRef.current?.contains(event.target) !== true) {
                setOpen(false);
            }
        };
        document.addEventListener("pointerdown", outside);
        return () => {
            document.removeEventListener("pointerdown", outside);
        };
    }, [open]);
    const attachMenu = useCallback((menu) => {
        menuRef.current = menu;
        menu
            ?.querySelector(itemSelector)
            ?.focus({ preventScroll: true });
    }, []);
    const close = (restoreFocus) => {
        setOpen(false);
        if (restoreFocus)
            buttonRef.current?.focus();
    };
    const keyDown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            close(true);
            return;
        }
        if (event.key === "Tab") {
            setOpen(false);
            return;
        }
        const entries = [
            ...event.currentTarget.querySelectorAll(itemSelector),
        ];
        const index = entries.indexOf(event.target);
        const last = entries.length - 1;
        const target = event.key === "ArrowDown"
            ? index >= last
                ? 0
                : index + 1
            : event.key === "ArrowUp"
                ? index <= 0
                    ? last
                    : index - 1
                : event.key === "Home"
                    ? 0
                    : event.key === "End"
                        ? last
                        : null;
        if (target === null)
            return;
        event.preventDefault();
        entries[target]?.focus();
    };
    return (_jsxs("span", { className: classes("od-action-menu", className), ref: rootRef, children: [_jsx("button", { "aria-controls": open ? menuId : undefined, "aria-expanded": open, "aria-haspopup": "menu", "aria-label": label, className: "od-icon-button od-action-menu-button", disabled: disabled || items.length === 0, onClick: () => {
                    setOpen((value) => !value);
                }, ref: buttonRef, title: label, type: "button", children: icon ?? _jsx(Icon, { name: "more" }) }), open ? (_jsx("div", { "aria-label": label, className: "od-action-menu-panel", id: menuId, onKeyDown: keyDown, ref: attachMenu, role: "menu", tabIndex: -1, children: items.map((item) => item.href === undefined ? (_jsxs("button", { className: "od-action-menu-item", "data-tone": item.tone ?? "default", onClick: () => {
                        close(true);
                        item.onSelect?.();
                    }, role: "menuitem", tabIndex: -1, type: "button", children: [item.icon, _jsx("span", { children: item.label })] }, item.id)) : (_jsxs("a", { className: "od-action-menu-item", "data-tone": item.tone ?? "default", href: item.href, onClick: () => {
                        setOpen(false);
                    }, role: "menuitem", tabIndex: -1, children: [item.icon, _jsx("span", { children: item.label })] }, item.id))) })) : null] }));
}
//# sourceMappingURL=ActionMenu.js.map