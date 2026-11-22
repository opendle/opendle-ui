import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { InlineAlert } from "./InlineAlert.js";
import { useAsyncAction } from "./useAsyncAction.js";
/**
 * A narrow modal with one small form: the fields, a failure message, Cancel
 * and a submit button with a pending state.
 */
export function FormDialog({ cancelLabel = "Cancel", children, className, description, errorMessage, onClose, onSubmit, open, submitDisabled = false, submitLabel, title, }) {
    const formId = useId();
    const action = useAsyncAction(errorMessage);
    const close = () => {
        if (action.pending)
            return;
        action.reset();
        onClose();
    };
    const submit = (event) => {
        event.preventDefault();
        if (action.pending || submitDisabled)
            return;
        void action.run(onSubmit).then((done) => {
            if (done)
                close();
        });
    };
    return (_jsxs(Dialog, { actions: _jsxs(_Fragment, { children: [_jsx(Button, { disabled: action.pending, onClick: close, variant: "secondary", children: cancelLabel }), _jsx(Button, { disabled: submitDisabled, form: formId, loading: action.pending, type: "submit", children: submitLabel })] }), appearance: "form", className: ["od-form-dialog", className].filter(Boolean).join(" "), closeDisabled: action.pending, ...(description === undefined ? {} : { description }), onClose: close, open: open, size: "narrow", title: title, children: [_jsx("form", { className: "od-form-dialog-form", id: formId, onSubmit: submit, children: children }), action.failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: action.failure }))] }));
}
//# sourceMappingURL=FormDialog.js.map