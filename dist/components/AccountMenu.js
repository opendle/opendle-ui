import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useRef, useState, } from "react";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
const itemSelector = '[role="menuitem"], [role="menuitemradio"]';
/**
 * The signed-in person at the end of the application sidebar. A press opens
 * a menu with the actions of the account.
 */
export function AccountMenu({ avatar, appearance = "account", className, detail, label, name, sections, }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const menuId = useId();
    const close = useCallback((restoreFocus) => {
        setOpen(false);
        if (restoreFocus)
            buttonRef.current?.focus();
    }, []);
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
    const focusFirst = useCallback((menu) => {
        menu?.querySelector(itemSelector)?.focus();
    }, []);
    function move(event) {
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
        const items = [
            ...event.currentTarget.querySelectorAll(itemSelector),
        ];
        const index = items.indexOf(document.activeElement);
        const last = items.length - 1;
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
        items[target]?.focus();
    }
    return (_jsxs("div", { className: classes("od-account", className), "data-appearance": appearance, ref: rootRef, children: [_jsxs("button", { "aria-label": label, "aria-controls": open ? menuId : undefined, "aria-expanded": open, "aria-haspopup": "menu", className: "od-account-menu", onClick: () => {
                    setOpen((value) => !value);
                }, ref: buttonRef, title: name, type: "button", children: [avatar, _jsxs("span", { className: "od-navigation-label", children: [_jsx("strong", { children: name }), detail === undefined ? null : _jsx("small", { children: detail })] }), _jsx(Icon, { className: "od-account-chevron", name: "chevron-down", size: 15 })] }), open ? (_jsx("div", { "aria-label": name, className: "od-account-popup", id: menuId, onKeyDown: move, ref: focusFirst, role: "menu", tabIndex: -1, children: sections.map((section) => (_jsxs("fieldset", { "aria-label": section.label, className: "od-account-section", children: [section.label === undefined ? null : (_jsx("span", { "aria-hidden": "true", className: "od-account-section-label", children: section.label })), section.items.map((item) => (_jsxs("button", { "aria-checked": item.current, className: "od-account-item", onClick: () => {
                                close(true);
                                item.onSelect();
                            }, role: item.current === undefined ? "menuitem" : "menuitemradio", tabIndex: -1, type: "button", children: [item.icon, _jsx("span", { children: item.label }), item.current === true ? (_jsx(Icon, { className: "od-account-item-check", name: "check", size: 15 })) : null] }, item.id)))] }, section.id))) })) : null] }));
}
//# sourceMappingURL=AccountMenu.js.map