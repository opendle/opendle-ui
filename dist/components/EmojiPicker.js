import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { conversationEmoji } from "./conversationLabels.js";
import { emojiData, searchEmoji } from "./emojiData.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { placePanel } from "./placePanel.js";
/** A button that opens a grid of emoji with a search field. */
export function EmojiPicker({ disabled = false, emoji = conversationEmoji, emptyLabel = "No emoji", label, onSelect, searchLabel = "Search emoji", }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const shown = query.trim() === ""
        ? [...new Set([...emoji, ...emojiData.map(([entry]) => entry)])]
        : searchEmoji(query);
    const rootRef = useRef(null);
    const gridRef = useRef(null);
    const gridId = useId();
    useLayoutEffect(() => {
        const button = rootRef.current?.querySelector("button");
        const grid = gridRef.current;
        if (!open || !button || !grid)
            return undefined;
        const update = () => {
            placePanel(button, grid);
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
    const focusSearch = useCallback((panel) => {
        gridRef.current = panel;
        panel?.querySelector("input")?.focus({ preventScroll: true });
    }, []);
    const close = () => {
        setOpen(false);
        setQuery("");
        rootRef.current?.querySelector("button")?.focus();
    };
    const choose = (entry) => {
        setOpen(false);
        setQuery("");
        onSelect(entry);
    };
    const closeOnEscape = (event) => {
        if (event.key !== "Escape")
            return;
        event.preventDefault();
        event.stopPropagation();
        close();
    };
    return (_jsxs("span", { className: "od-emoji", ref: rootRef, children: [_jsx(IconButton, { "aria-controls": open ? gridId : undefined, "aria-expanded": open, disabled: disabled, icon: _jsx(Icon, { name: "smile" }), label: label, onClick: () => {
                    setOpen((value) => !value);
                } }), open ? (_jsxs("div", { className: "od-emoji-panel", id: gridId, ref: focusSearch, children: [_jsx("input", { "aria-label": searchLabel, className: "od-emoji-search", onChange: (event) => {
                            setQuery(event.currentTarget.value);
                        }, onKeyDown: (event) => {
                            closeOnEscape(event);
                            const first = shown[0];
                            if (event.key === "Enter" && first !== undefined) {
                                event.preventDefault();
                                choose(first);
                            }
                        }, placeholder: searchLabel, type: "search", value: query }), shown.length === 0 ? (_jsx("p", { className: "od-emoji-empty", children: emptyLabel })) : (_jsx("fieldset", { "aria-label": label, className: "od-emoji-grid", children: shown.map((entry) => (_jsx("button", { onKeyDown: closeOnEscape, onClick: () => {
                                choose(entry);
                            }, type: "button", children: entry }, entry))) }))] })) : null] }));
}
//# sourceMappingURL=EmojiPicker.js.map