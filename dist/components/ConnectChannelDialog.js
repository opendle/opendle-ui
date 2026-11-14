import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useState } from "react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { TextControl } from "./FormControls.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import { useAsyncAction } from "./useAsyncAction.js";
/** Select a network, then go to its authorization or give an app password. */
export function ConnectChannelDialog({ errorMessage, labels, network = null, networks, onClose, onPasswordConnect, open, }) {
    const formId = useId();
    const [selected, setSelected] = useState(null);
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const connect = useAsyncAction(errorMessage);
    const current = selected ?? network;
    const form = networks.find((entry) => entry.network === current) ?? null;
    const close = () => {
        setSelected(null);
        setHandle("");
        setPassword("");
        connect.reset();
        onClose();
    };
    const submit = (event) => {
        event.preventDefault();
        if (form === null || connect.pending)
            return;
        void connect
            .run(() => onPasswordConnect(form.network, handle.trim(), password))
            .then((done) => {
            if (done)
                close();
        });
    };
    return (_jsxs(Dialog, { actions: form === null ? undefined : (_jsxs(_Fragment, { children: [network === null ? (_jsx(Button, { disabled: connect.pending, onClick: () => {
                        setSelected(null);
                        connect.reset();
                    }, variant: "quiet", children: labels.back })) : null, _jsx(Button, { disabled: connect.pending || handle.trim() === "" || password === "", form: formId, type: "submit", children: labels.submit })] })), className: "od-connect-dialog", closeDisabled: connect.pending, closeLabel: labels.close, onClose: close, open: open, size: "narrow", title: form === null ? labels.connectTitle : form.label, children: [form === null ? (_jsx("ul", { className: "od-connect-options", children: networks.map((entry) => (_jsx("li", { children: entry.href === undefined ? (_jsxs("button", { className: "od-connect-option", onClick: () => {
                            setSelected(entry.network);
                        }, type: "button", children: [_jsx(NetworkIcon, { badge: true, network: entry.network }), _jsx("span", { children: entry.label }), _jsx(Icon, { name: "chevron-right", size: 15 })] })) : (_jsxs("a", { className: "od-connect-option", href: entry.href, children: [_jsx(NetworkIcon, { badge: true, network: entry.network }), _jsx("span", { children: entry.label }), _jsx(Icon, { name: "external-link", size: 15 })] })) }, entry.network))) })) : (_jsxs("form", { className: "od-connect-form", id: formId, onSubmit: submit, children: [_jsx(TextControl, { autoCapitalize: "none", autoComplete: "username", "data-dialog-initial-focus": "true", label: labels.handle, onChange: (event) => {
                            setHandle(event.currentTarget.value);
                        }, spellCheck: false, value: handle }), _jsx(TextControl, { autoComplete: "off", label: labels.password, onChange: (event) => {
                            setPassword(event.currentTarget.value);
                        }, spellCheck: false, value: password })] })), connect.failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: connect.failure }))] }));
}
//# sourceMappingURL=ConnectChannelDialog.js.map