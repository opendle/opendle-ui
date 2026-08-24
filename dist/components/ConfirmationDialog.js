import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useId, useLayoutEffect, useRef, useState, } from "react";
import { Button } from "./Button.js";
function isBackdropClick(dialog, event) {
    if (event.target !== dialog)
        return false;
    const bounds = dialog.getBoundingClientRect();
    return (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom);
}
function openModal(dialog) {
    if (dialog.open)
        return;
    if (typeof dialog.showModal === "function") {
        dialog.showModal();
        return;
    }
    dialog.setAttribute("open", "");
}
function closeModal(dialog) {
    if (!dialog?.open)
        return;
    if (typeof dialog.close === "function") {
        dialog.close();
        return;
    }
    dialog.removeAttribute("open");
}
function restoreFocus(trigger) {
    if (!trigger?.isConnected)
        return;
    const apply = () => {
        const active = document.activeElement;
        if (active instanceof HTMLElement && active.closest("dialog[open]"))
            return;
        if (trigger.isConnected)
            trigger.focus({ preventScroll: true });
    };
    if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(apply);
    else
        apply();
}
/** A modal confirmation with an optional exact impact-statement check. */
export function ConfirmationDialog({ cancelLabel = "Cancel", className, confirmLabel, description, impactLabel = "Enter the impact statement to continue", impactStatement, onCancel, onConfirm, open, pending = false, pendingLabel = "Working…", title, ...props }) {
    const titleId = useId();
    const descriptionId = useId();
    const dialogRef = useRef(null);
    const actionsRef = useRef(null);
    const triggerRef = useRef(null);
    const wasOpenRef = useRef(false);
    const requestCancel = useCallback(() => {
        if (!pending)
            onCancel();
    }, [onCancel, pending]);
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        if (open) {
            if (!wasOpenRef.current) {
                const active = document.activeElement;
                triggerRef.current = active instanceof HTMLElement ? active : null;
            }
            openModal(dialog);
            if (!wasOpenRef.current)
                actionsRef.current?.querySelector("button")?.focus();
        }
        else if (wasOpenRef.current) {
            closeModal(dialog);
            restoreFocus(triggerRef.current);
        }
        wasOpenRef.current = open;
    }, [open]);
    useLayoutEffect(() => () => {
        closeModal(dialogRef.current);
        restoreFocus(triggerRef.current);
    }, []);
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        const handleClick = (event) => {
            if (isBackdropClick(dialog, event))
                requestCancel();
        };
        dialog.addEventListener("click", handleClick);
        return () => {
            dialog.removeEventListener("click", handleClick);
        };
    }, [requestCancel]);
    return (_jsx("dialog", { ...props, "aria-describedby": descriptionId, "aria-labelledby": titleId, className: ["od-confirmation-dialog", className]
            .filter(Boolean)
            .join(" "), onCancel: (event) => {
            event.preventDefault();
            requestCancel();
        }, ref: dialogRef, children: open ? (_jsx(ConfirmationContent, { cancelLabel: cancelLabel, actionsRef: actionsRef, confirmLabel: confirmLabel, description: description, descriptionId: descriptionId, impactLabel: impactLabel, ...(impactStatement === undefined ? {} : { impactStatement }), onCancel: requestCancel, onConfirm: onConfirm, pending: pending, pendingLabel: pendingLabel, title: title, titleId: titleId })) : null }));
}
function ConfirmationContent({ cancelLabel, actionsRef, confirmLabel, description, descriptionId, impactLabel, impactStatement, onCancel, onConfirm, pending, pendingLabel, title, titleId, }) {
    const [impact, setImpact] = useState("");
    const impactMatches = impactStatement === undefined || impact === impactStatement;
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: "od-confirmation-dialog-heading", children: [_jsx("h2", { id: titleId, children: title }), _jsx("div", { id: descriptionId, children: description })] }), impactStatement === undefined ? null : (_jsxs("label", { className: "od-confirmation-dialog-impact", children: [_jsx("span", { children: impactLabel }), _jsx("strong", { children: impactStatement }), _jsx("input", { "aria-label": typeof impactLabel === "string"
                            ? impactLabel
                            : "Confirmation impact statement", autoComplete: "off", disabled: pending, onChange: (event) => {
                            setImpact(event.target.value);
                        }, value: impact })] })), _jsxs("footer", { className: "od-confirmation-dialog-actions", ref: actionsRef, children: [_jsx(Button, { disabled: pending, onClick: onCancel, type: "button", variant: "quiet", children: cancelLabel }), _jsx(ConfirmationButton, { confirmLabel: confirmLabel, impactMatches: impactMatches, onConfirm: onConfirm, pending: pending, pendingLabel: pendingLabel }, pending ? "pending" : "ready")] })] }));
}
function ConfirmationButton({ confirmLabel, impactMatches, onConfirm, pending, pendingLabel, }) {
    const submittedRef = useRef(false);
    return (_jsx(Button, { disabled: pending || !impactMatches, onClick: () => {
            if (pending || submittedRef.current || !impactMatches)
                return;
            submittedRef.current = true;
            try {
                onConfirm();
            }
            catch (error) {
                submittedRef.current = false;
                throw error;
            }
        }, type: "button", children: pending ? pendingLabel : confirmLabel }));
}
//# sourceMappingURL=ConfirmationDialog.js.map