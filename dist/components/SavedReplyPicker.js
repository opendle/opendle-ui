import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { placePanel } from "./placePanel.js";
/** A button that opens the list of saved replies, next to the emoji button. */
export function SavedReplyPicker({ disabled = false, label, onSelect, replies, }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const panelRef = useRef(null);
    const panelId = useId();
    useLayoutEffect(() => {
        const button = rootRef.current?.querySelector("button");
        const panel = panelRef.current;
        if (!open || !button || !panel)
            return undefined;
        const update = () => {
            placePanel(button, panel);
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [open]);
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
    const focusFirst = useCallback((panel) => {
        panelRef.current = panel;
        panel?.querySelector("button")?.focus({ preventScroll: true });
    }, []);
    const keyDown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            rootRef.current?.querySelector("button")?.focus();
            return;
        }
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp")
            return;
        const buttons = [
            ...(panelRef.current?.querySelectorAll("button") ?? []),
        ];
        const index = buttons.indexOf(event.target);
        const next = buttons[(index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
            buttons.length];
        event.preventDefault();
        next?.focus();
    };
    return (_jsxs("span", { className: "od-saved-reply-picker", ref: rootRef, children: [_jsx(IconButton, { "aria-controls": open ? panelId : undefined, "aria-expanded": open, "aria-haspopup": "menu", disabled: disabled, icon: _jsx(Icon, { name: "book" }), label: label, onClick: () => {
                    setOpen((value) => !value);
                } }), open ? (_jsx("div", { "aria-label": label, className: "od-saved-reply-panel", id: panelId, onKeyDown: keyDown, ref: focusFirst, role: "menu", tabIndex: -1, children: replies.map((reply) => (_jsxs("button", { onClick: () => {
                        setOpen(false);
                        onSelect(reply);
                    }, role: "menuitem", type: "button", children: [_jsx("strong", { children: reply.name }), _jsx("span", { children: reply.text })] }, reply.id))) })) : null] }));
}
//# sourceMappingURL=SavedReplyPicker.js.map