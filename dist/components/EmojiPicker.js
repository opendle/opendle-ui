import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { conversationEmoji } from "./conversationLabels.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
const gap = 4;
const margin = 8;
/**
 * Put the grid below the button, or above it when the window has no room
 * below. The grid is fixed to the window, so a container that hides its
 * overflow does not cut it.
 */
function place(button, grid) {
    const bounds = button.getBoundingClientRect();
    const height = grid.offsetHeight;
    const width = grid.offsetWidth;
    const below = bounds.bottom + gap + height <= window.innerHeight - margin;
    grid.style.top = `${String(below ? bounds.bottom + gap : Math.max(margin, bounds.top - gap - height))}px`;
    grid.style.left = `${String(Math.max(margin, Math.min(bounds.left, window.innerWidth - width - margin)))}px`;
    grid.dataset.side = below ? "below" : "above";
}
/** A button that opens a small grid of emoji. */
export function EmojiPicker({ disabled = false, emoji = conversationEmoji, label, onSelect, }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const gridRef = useRef(null);
    const gridId = useId();
    useLayoutEffect(() => {
        const button = rootRef.current?.querySelector("button");
        const grid = gridRef.current;
        if (!open || !button || !grid)
            return undefined;
        const update = () => {
            place(button, grid);
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
    const focusFirst = useCallback((grid) => {
        gridRef.current = grid;
        grid?.querySelector("button")?.focus({ preventScroll: true });
    }, []);
    const closeOnEscape = (event) => {
        if (event.key !== "Escape")
            return;
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        rootRef.current?.querySelector("button")?.focus();
    };
    return (_jsxs("span", { className: "od-emoji", ref: rootRef, children: [_jsx(IconButton, { "aria-controls": open ? gridId : undefined, "aria-expanded": open, disabled: disabled, icon: _jsx(Icon, { name: "smile" }), label: label, onClick: () => {
                    setOpen((value) => !value);
                } }), open ? (_jsx("fieldset", { "aria-label": label, className: "od-emoji-grid", id: gridId, ref: focusFirst, children: emoji.map((entry) => (_jsx("button", { onKeyDown: closeOnEscape, onClick: () => {
                        setOpen(false);
                        onSelect(entry);
                    }, type: "button", children: entry }, entry))) })) : null] }));
}
//# sourceMappingURL=EmojiPicker.js.map