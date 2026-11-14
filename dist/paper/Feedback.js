import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, useState, } from "react";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
const toneIcons = {
    neutral: "info",
    success: "success",
    warning: "alert",
    error: "alert",
};
/** A message next to the control or form that it describes. */
export function InlineAlert({ children, className, tone = "neutral", }) {
    return (_jsxs("div", { className: classes("pp-alert", className), "data-tone": tone, role: tone === "error" ? "alert" : "status", children: [_jsx(Icon, { name: toneIcons[tone], size: 16 }), _jsx("span", { children: children })] }));
}
/** Short-lived messages above all content, including an open dialog. */
export function ToastStack({ label, toasts }) {
    const regionRef = useRef(null);
    const newest = toasts.at(-1)?.id ?? null;
    useLayoutEffect(() => {
        const region = regionRef.current;
        if (region === null || typeof region.showPopover !== "function")
            return;
        // Show again for each new message, so it is above a dialog opened later.
        if (region.matches(":popover-open"))
            region.hidePopover();
        if (newest !== null)
            region.showPopover();
    }, [newest]);
    return (_jsx("section", { "aria-label": label, className: "pp-toasts", popover: "manual", ref: regionRef, children: toasts.map((toast) => (_jsxs("output", { className: "pp-toast", "data-tone": toast.tone, children: [_jsx(Icon, { name: toast.tone === "error" ? "alert" : "check", size: 16 }), toast.message] }, toast.id))) }));
}
/** Hold toast messages and remove each one after `duration` milliseconds. */
export function useToastQueue(duration = 4000) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);
    const showToast = useCallback((message, tone = "success") => {
        const id = nextId.current++;
        setToasts((current) => [...current.slice(-2), { id, message, tone }]);
        setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, duration);
    }, [duration]);
    return { toasts, showToast };
}
//# sourceMappingURL=Feedback.js.map