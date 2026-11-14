import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffectEvent, useId, useLayoutEffect, useRef, useState, } from "react";
import { Button, IconButton } from "./Button.js";
import { classes } from "./classes.js";
import { InlineAlert } from "./Feedback.js";
import { Icon } from "./Icon.js";
/** A modal dialog on the native `dialog` element. */
export function Dialog({ actions, children, className, closeDisabled = false, closeLabel, onClose, open, size = "default", title, }) {
    const dialogRef = useRef(null);
    const titleId = useId();
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (dialog === null)
            return;
        if (open && !dialog.open) {
            dialog.showModal();
            dialog.querySelector("[data-autofocus]")?.focus();
        }
        if (!open && dialog.open)
            dialog.close();
    }, [open]);
    const requestClose = useEffectEvent(() => {
        if (!closeDisabled)
            onClose();
    });
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (dialog === null)
            return;
        const cancel = (event) => {
            event.preventDefault();
            requestClose();
        };
        let pressedBackdrop = false;
        const press = (event) => {
            pressedBackdrop = event.target === dialog;
        };
        const release = (event) => {
            if (pressedBackdrop && event.target === dialog)
                requestClose();
            pressedBackdrop = false;
        };
        dialog.addEventListener("cancel", cancel);
        dialog.addEventListener("mousedown", press);
        dialog.addEventListener("click", release);
        return () => {
            dialog.removeEventListener("cancel", cancel);
            dialog.removeEventListener("mousedown", press);
            dialog.removeEventListener("click", release);
        };
    }, []);
    return (_jsx("dialog", { "aria-labelledby": titleId, className: classes("pp-dialog", className), "data-size": size, ref: dialogRef, children: open ? (_jsxs(_Fragment, { children: [_jsxs("header", { className: "pp-dialog-header", children: [_jsx("h2", { id: titleId, children: title }), _jsx(IconButton, { disabled: closeDisabled, icon: _jsx(Icon, { name: "close" }), label: closeLabel, onClick: onClose })] }), _jsx("div", { className: "pp-dialog-body", children: children }), actions ? (_jsx("footer", { className: "pp-dialog-actions", children: actions })) : null] })) : null }));
}
/** A dialog that asks before one action and shows its failure. */
export function ConfirmDialog({ cancelLabel, children, closeLabel, confirmLabel, errorMessage, onClose, onConfirm, open, title, tone = "default", }) {
    const [pending, setPending] = useState(false);
    const [failure, setFailure] = useState(null);
    const close = useCallback(() => {
        setFailure(null);
        onClose();
    }, [onClose]);
    const confirm = useCallback(async () => {
        setPending(true);
        setFailure(null);
        try {
            await onConfirm();
            onClose();
        }
        catch (error) {
            setFailure(errorMessage(error));
        }
        finally {
            setPending(false);
        }
    }, [errorMessage, onClose, onConfirm]);
    return (_jsxs(Dialog, { actions: _jsxs(_Fragment, { children: [_jsx(Button, { disabled: pending, onClick: close, children: cancelLabel }), _jsx(Button, { disabled: pending, onClick: () => void confirm(), variant: tone === "danger" ? "danger" : "primary", children: confirmLabel })] }), closeDisabled: pending, closeLabel: closeLabel, onClose: close, open: open, title: title, children: [children, failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: failure }))] }));
}
//# sourceMappingURL=Dialog.js.map