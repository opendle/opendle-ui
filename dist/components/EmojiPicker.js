import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useRef, useState, } from "react";
import { conversationEmoji } from "./conversationLabels.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
/** A button that opens a small grid of emoji. */
export function EmojiPicker({ disabled = false, emoji = conversationEmoji, label, onSelect, }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const gridId = useId();
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
        grid?.querySelector("button")?.focus();
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