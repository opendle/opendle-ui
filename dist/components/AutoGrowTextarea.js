import { jsx as _jsx } from "react/jsx-runtime";
import { useLayoutEffect, useRef } from "react";
function resizeTextarea(textarea, maxHeight) {
    if (!textarea)
        return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${String(nextHeight)}px`;
    textarea.style.overflowY =
        textarea.scrollHeight > maxHeight ? "auto" : "hidden";
}
export function AutoGrowTextarea({ maxHeight = 240, onInput, rows = 2, style, value, defaultValue, ...props }) {
    const textareaRef = useRef(null);
    useLayoutEffect(() => {
        resizeTextarea(textareaRef.current, maxHeight);
    }, [defaultValue, maxHeight, value]);
    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea || typeof ResizeObserver === "undefined")
            return;
        let observedWidth = textarea.getBoundingClientRect().width;
        const observer = new ResizeObserver(([entry]) => {
            if (!entry || entry.contentRect.width === observedWidth)
                return;
            observedWidth = entry.contentRect.width;
            resizeTextarea(textarea, maxHeight);
        });
        observer.observe(textarea);
        return () => {
            observer.disconnect();
        };
    }, [maxHeight]);
    function resizeForContent(event) {
        resizeTextarea(event.currentTarget, maxHeight);
        onInput?.(event);
    }
    return (_jsx("textarea", { ...props, ref: textareaRef, rows: rows, value: value, defaultValue: defaultValue, onInput: resizeForContent, style: {
            ...style,
            height: "auto",
            minHeight: 0,
            maxHeight,
            overflowY: "hidden",
            resize: "none",
        } }));
}
//# sourceMappingURL=AutoGrowTextarea.js.map