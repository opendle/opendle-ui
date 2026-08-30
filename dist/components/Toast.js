import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
function findActiveModalDialog() {
    if (typeof document === "undefined")
        return null;
    try {
        const focusedDialog = document.activeElement?.closest("dialog:modal");
        if (focusedDialog instanceof HTMLDialogElement)
            return focusedDialog;
        const modalDialogs = document.querySelectorAll("dialog:modal");
        return modalDialogs.item(modalDialogs.length - 1);
    }
    catch {
        return null;
    }
}
function useActiveModalDialog() {
    const [activeModalDialog, setActiveModalDialog] = useState(null);
    useLayoutEffect(() => {
        const updateActiveModalDialog = () => {
            setActiveModalDialog(findActiveModalDialog());
        };
        updateActiveModalDialog();
        document.addEventListener("focusin", updateActiveModalDialog);
        const observer = new MutationObserver(updateActiveModalDialog);
        observer.observe(document.documentElement, {
            attributeFilter: ["open"],
            attributes: true,
            childList: true,
            subtree: true,
        });
        return () => {
            document.removeEventListener("focusin", updateActiveModalDialog);
            observer.disconnect();
        };
    }, []);
    return activeModalDialog;
}
export function Toast({ children, className, onDismiss, ...props }) {
    const activeModalDialog = useActiveModalDialog();
    const toast = (_jsxs("output", { ...props, className: ["od-toast", className].filter(Boolean).join(" "), children: [_jsx("span", { children: children }), onDismiss ? (_jsx("button", { type: "button", "aria-label": "Dismiss message", onClick: onDismiss, children: "\u00D7" })) : null] }));
    return activeModalDialog === null
        ? toast
        : createPortal(toast, activeModalDialog);
}
//# sourceMappingURL=Toast.js.map