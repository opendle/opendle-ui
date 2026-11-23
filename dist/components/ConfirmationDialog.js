import { Fragment as _Fragment, jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useId, useRef, useState, } from "react";
import { Button } from "./Button.js";
import { CopyButton } from "./CopyButton.js";
import { InlineAlert } from "./InlineAlert.js";
import { Dialog } from "./Dialog.js";
// The confirm button is the submitter of the impact form: Enter in the input
// clicks it only while it is enabled. The click does the work.
const keepPage = (event) => {
    event.preventDefault();
};
const typeToConfirm = (statement) => (_jsxs(_Fragment, { children: ["Type ", statement, " to confirm."] }));
/** A modal confirmation with an optional exact impact-statement check. */
export function ConfirmationDialog(props) {
    if (props.impactStatement?.trim() === "") {
        throw new TypeError("A confirmation impact statement must not be empty.");
    }
    return _jsx(ConfirmationState, { ...props }, props.open ? "open" : "closed");
}
function ConfirmationState({ cancelLabel = "Cancel", className, confirmOnEnter = false, confirmLabel, description, error, tone = "default", copiedLabel = "Copied", copyLabel = "Copy", impactInputLabel = "Confirmation text", impactLabel = typeToConfirm, impactStatement, irreversible = false, irreversibleLabel = "This cannot be undone.", onCancel, onConfirm, open, pending = false, pendingLabel = "Working…", returnFocusRef, title, ...props }) {
    const impactId = useId();
    const formId = useId();
    const [impact, setImpact] = useState("");
    const impactMatches = impactStatement === undefined || impact === impactStatement;
    const confirmFocus = impactStatement === undefined && confirmOnEnter;
    return (_jsxs(Dialog, { ...props, actions: _jsxs(_Fragment, { children: [_jsx(Button, { ...(confirmFocus || impactStatement !== undefined
                        ? {}
                        : { "data-dialog-initial-focus": "true" }), disabled: pending, onClick: onCancel, type: "button", variant: "quiet", children: cancelLabel }), _jsx(ConfirmationButton, { confirmLabel: confirmLabel, focus: confirmFocus, form: impactStatement === undefined ? undefined : formId, impactMatches: impactMatches, onConfirm: onConfirm, pending: pending, pendingLabel: pendingLabel, tone: tone }, pending ? "pending" : "ready")] }), actionsClassName: "od-confirmation-dialog-actions", bodyClassName: "od-confirmation-dialog-body", className: ["od-confirmation-dialog", className]
            .filter(Boolean)
            .join(" "), closeDisabled: pending, description: description, headerClassName: "od-confirmation-dialog-heading", onClose: onCancel, open: open, ...(returnFocusRef === undefined ? {} : { returnFocusRef }), showCloseButton: false, size: "narrow", title: title, children: [error === undefined || error === null ? null : (_jsx(InlineAlert, { tone: "error", children: error })), irreversible ? (_jsx("p", { className: "od-confirmation-dialog-irreversible", children: irreversibleLabel })) : null, impactStatement === undefined ? null : (_jsxs("form", { className: "od-confirmation-dialog-impact", id: formId, onSubmit: keepPage, children: [_jsx("p", { children: impactLabel(_jsxs("span", { className: "od-confirmation-dialog-statement", children: [_jsx("code", { id: impactId, children: impactStatement }), _jsx(CopyButton, { copiedLabel: copiedLabel, copyLabel: copyLabel, value: impactStatement })] })) }), _jsx("input", { "aria-describedby": impactId, "aria-label": impactInputLabel, autoCapitalize: "none", autoComplete: "off", "data-dialog-initial-focus": "true", disabled: pending, onChange: (event) => {
                            setImpact(event.target.value);
                        }, placeholder: impactStatement, spellCheck: false, value: impact })] }))] }));
}
function ConfirmationButton({ confirmLabel, focus, form, impactMatches, onConfirm, pending, pendingLabel, tone, }) {
    const submittedRef = useRef(false);
    return (_jsx(Button, { ...(focus ? { "data-dialog-initial-focus": "true" } : {}), ...(form === undefined ? {} : { form }), disabled: !impactMatches, loading: pending, onClick: () => {
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
        }, type: form === undefined ? "button" : "submit", variant: tone === "danger" ? "danger" : "primary", children: pending ? pendingLabel : confirmLabel }));
}
//# sourceMappingURL=ConfirmationDialog.js.map