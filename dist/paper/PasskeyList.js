import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from "react";
import { DateTime } from "../components/DateTime.js";
import { Button, IconButton } from "./Button.js";
import { ConfirmDialog } from "./Dialog.js";
import { InlineAlert } from "./Feedback.js";
import { Icon } from "./Icon.js";
import { passkeyListLabels } from "./labels.js";
import { Card, ItemList, ItemRow, Section } from "./Page.js";
const dateFormat = { dateStyle: "medium" };
const passkeyIcon = _jsx(Icon, { name: "passkey" });
/**
 * The passkeys of one account. The last passkey has no remove button, because
 * the account must keep one.
 */
export function PasskeyList({ errorMessage, items, labels = passkeyListLabels, onAdd, onRemove, }) {
    const [adding, setAdding] = useState(false);
    const [failure, setFailure] = useState(null);
    const [removing, setRemoving] = useState(null);
    const add = useCallback(async () => {
        setAdding(true);
        setFailure(null);
        try {
            await onAdd();
        }
        catch (error) {
            setFailure(errorMessage(error));
        }
        finally {
            setAdding(false);
        }
    }, [errorMessage, onAdd]);
    const removeMessage = useCallback((error) => errorMessage(error) ?? "", [errorMessage]);
    return (_jsxs(Section, { actions: _jsx(Button, { disabled: adding, icon: _jsx(Icon, { name: "plus", size: 15 }), onClick: () => void add(), children: adding ? labels.adding : labels.add }), title: labels.title, children: [failure === null ? null : (_jsx(InlineAlert, { className: "pp-section-alert", tone: "error", children: failure })), _jsx(Card, { children: _jsx(ItemList, { children: items.map((item) => (_jsx(PasskeyRow, { item: item, labels: labels, onRemove: items.length > 1 ? setRemoving : null }, item.id))) }) }), _jsx(ConfirmDialog, { cancelLabel: labels.cancel, closeLabel: labels.close, confirmLabel: labels.remove, errorMessage: removeMessage, onClose: () => {
                    setRemoving(null);
                }, onConfirm: () => removing === null ? Promise.resolve() : onRemove(removing.id), open: removing !== null, title: labels.removeTitle, tone: "danger", children: _jsx("p", { children: removing === null ? null : removing.label || labels.unnamed }) })] }));
}
function PasskeyRow({ item, labels, onRemove }) {
    const name = item.label || labels.unnamed;
    const meta = useMemo(() => (_jsxs(_Fragment, { children: [labels.added, " ", _jsx(DateTime, { format: dateFormat, value: item.createdAt }), item.lastUsedAt ? (_jsxs(_Fragment, { children: [" · ", labels.lastUsed, " ", _jsx(DateTime, { format: dateFormat, value: item.lastUsedAt })] })) : null] })), [item, labels]);
    const actions = useMemo(() => onRemove === null ? null : (_jsx(IconButton, { icon: _jsx(Icon, { name: "trash" }), label: `${labels.remove}: ${name}`, onClick: () => {
            onRemove(item);
        }, tone: "danger" })), [item, labels.remove, name, onRemove]);
    return (_jsx(ItemRow, { actions: actions, icon: passkeyIcon, meta: meta, title: name }));
}
//# sourceMappingURL=PasskeyList.js.map