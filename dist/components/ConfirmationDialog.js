import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useRef, useState, } from "react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
/** A modal confirmation with an optional exact impact-statement check. */
export function ConfirmationDialog(props) {
    if (props.impactStatement?.trim() === "") {
        throw new TypeError("A confirmation impact statement must not be empty.");
    }
    return _jsx(ConfirmationState, { ...props }, props.open ? "open" : "closed");
}
function ConfirmationState({ cancelLabel = "Cancel", className, confirmLabel, description, impactLabel = "Enter the impact statement to continue", impactStatement, onCancel, onConfirm, open, pending = false, pendingLabel = "Working…", returnFocusRef, title, ...props }) {
    const impactId = useId();
    const [impact, setImpact] = useState("");
    const impactMatches = impactStatement === undefined || impact === impactStatement;
    return (_jsx(Dialog, { ...props, actions: _jsxs(_Fragment, { children: [_jsx(Button, { "data-dialog-initial-focus": "true", disabled: pending, onClick: onCancel, type: "button", variant: "quiet", children: cancelLabel }), _jsx(ConfirmationButton, { confirmLabel: confirmLabel, impactMatches: impactMatches, onConfirm: onConfirm, pending: pending, pendingLabel: pendingLabel }, pending ? "pending" : "ready")] }), actionsClassName: "od-confirmation-dialog-actions", bodyClassName: "od-confirmation-dialog-body", className: ["od-confirmation-dialog", className]
            .filter(Boolean)
            .join(" "), closeDisabled: pending, description: description, headerClassName: "od-confirmation-dialog-heading", onClose: onCancel, open: open, ...(returnFocusRef === undefined ? {} : { returnFocusRef }), showCloseButton: false, size: "narrow", title: title, children: impactStatement === undefined ? null : (_jsxs("label", { className: "od-confirmation-dialog-impact", children: [_jsx("span", { children: impactLabel }), _jsx("strong", { id: impactId, children: impactStatement }), _jsx("input", { "aria-describedby": impactId, "aria-label": typeof impactLabel === "string"
                        ? impactLabel
                        : "Confirmation impact statement", autoComplete: "off", disabled: pending, onChange: (event) => {
                        setImpact(event.target.value);
                    }, value: impact })] })) }));
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