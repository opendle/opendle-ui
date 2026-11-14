import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useId, useState } from "react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { InlineAlert } from "./Feedback.js";
import { TextField } from "./Fields.js";
import { SecretReveal } from "./SecretReveal.js";
const initialState = {
    name: "",
    pending: false,
    failure: null,
    secret: null,
};
/** Ask for a token name, create the token, then show its secret one time. */
export function CreateTokenDialog({ errorMessage, labels, onClose, onCreate, open, }) {
    const formId = useId();
    const [state, setState] = useState(initialState);
    const { failure, name, pending, secret } = state;
    const close = useCallback(() => {
        setState(initialState);
        onClose();
    }, [onClose]);
    const submit = useCallback(async (event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (trimmed === "" || pending)
            return;
        setState((current) => ({ ...current, pending: true, failure: null }));
        try {
            const created = await onCreate(trimmed);
            setState((current) => ({
                ...current,
                pending: false,
                secret: created,
            }));
        }
        catch (error) {
            setState((current) => ({
                ...current,
                pending: false,
                failure: errorMessage(error),
            }));
        }
    }, [errorMessage, name, onCreate, pending]);
    const actions = secret === null ? (_jsxs(_Fragment, { children: [_jsx(Button, { disabled: pending, onClick: close, children: labels.cancel }), _jsx(Button, { disabled: pending || name.trim() === "", form: formId, type: "submit", variant: "primary", children: labels.submit })] })) : (_jsx(Button, { onClick: close, variant: "primary", children: labels.done }));
    return (_jsxs(Dialog, { actions: actions, closeDisabled: pending, closeLabel: labels.close, onClose: close, open: open, title: secret === null ? labels.createTitle : labels.createdTitle, children: [secret === null ? (_jsx("form", { id: formId, onSubmit: (event) => void submit(event), children: _jsx(TextField, { autoComplete: "off", "data-autofocus": true, label: labels.name, maxLength: 80, onChange: (event) => {
                        const next = event.currentTarget.value;
                        setState((current) => ({ ...current, name: next }));
                    }, value: name }) })) : (_jsx(SecretReveal, { copiedLabel: labels.copied, copyLabel: labels.copy, label: labels.secret, value: secret })), failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: failure }))] }));
}
//# sourceMappingURL=CreateTokenDialog.js.map