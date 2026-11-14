import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from "react";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { DateTime } from "./DateTime.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { passkeyListLabels } from "./identityLabels.js";
import { InlineAlert } from "./InlineAlert.js";
import { InlineEditableText } from "./InlineEditableText.js";
import { ItemList } from "./ItemList.js";
import { ItemRow } from "./ItemRow.js";
import { Section } from "./Section.js";
import { useAsyncAction } from "./useAsyncAction.js";
const dateFormat = { dateStyle: "medium" };
const passkeyIcon = _jsx(Icon, { name: "passkey" });
/**
 * The passkeys of one account. The last passkey has no remove button, because
 * the account must keep one.
 */
export function PasskeyList({ errorMessage, items, labels = passkeyListLabels, onAdd, onRemove, onRename, }) {
    const change = useAsyncAction(errorMessage);
    const removal = useAsyncAction(errorMessage);
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState(null);
    const { run: runChange } = change;
    const add = useCallback(async () => {
        setAdding(true);
        await runChange(onAdd);
        setAdding(false);
    }, [onAdd, runChange]);
    const rename = useMemo(() => onRename === undefined
        ? null
        : async (id, label) => {
            const done = await runChange(() => onRename(id, label));
            if (!done)
                throw new Error("The passkey name was not stored.");
        }, [onRename, runChange]);
    const closeRemoval = () => {
        removal.reset();
        setRemoving(null);
    };
    return (_jsxs(Section, { actions: _jsx(Button, { disabled: adding, icon: _jsx(Icon, { name: "plus", size: 15 }), onClick: () => void add(), variant: "secondary", children: adding ? labels.adding : labels.add }), title: labels.title, children: [change.failure === null ? null : (_jsx(InlineAlert, { className: "od-section-alert", tone: "error", children: change.failure })), _jsx(Card, { children: _jsx(ItemList, { children: items.map((item) => (_jsx(PasskeyRow, { item: item, labels: labels, onRemove: items.length > 1 ? setRemoving : null, onRename: rename }, item.id))) }) }), _jsx(ConfirmationDialog, { cancelLabel: labels.cancel, confirmLabel: labels.remove, description: removing === null ? "" : removing.label || labels.unnamed, error: removal.failure, onCancel: closeRemoval, onConfirm: () => {
                    if (removing === null)
                        return;
                    void removal
                        .run(() => onRemove(removing.id))
                        .then((done) => {
                        if (done)
                            setRemoving(null);
                    });
                }, open: removing !== null, pending: removal.pending, pendingLabel: labels.remove, title: labels.removeTitle, tone: "danger" })] }));
}
function PasskeyRow({ item, labels, onRemove, onRename }) {
    const name = item.label || labels.unnamed;
    const title = useMemo(() => onRename === null ? (name) : (_jsx(InlineEditableText, { label: `${labels.rename}: ${name}`, maxLength: 64, onSave: (label) => onRename(item.id, label), value: name })), [item.id, labels.rename, name, onRename]);
    const meta = useMemo(() => (_jsxs(_Fragment, { children: [labels.added, " ", _jsx(DateTime, { format: dateFormat, value: item.createdAt }), item.lastUsedAt ? (_jsxs(_Fragment, { children: [" · ", labels.lastUsed, " ", _jsx(DateTime, { format: dateFormat, value: item.lastUsedAt })] })) : null] })), [item, labels]);
    const actions = useMemo(() => onRemove === null ? null : (_jsx(IconButton, { icon: _jsx(Icon, { name: "trash" }), label: `${labels.remove}: ${name}`, onClick: () => {
            onRemove(item);
        }, tone: "danger" })), [item, labels.remove, name, onRemove]);
    return (_jsx(ItemRow, { actions: actions, icon: passkeyIcon, meta: meta, title: title }));
}
//# sourceMappingURL=PasskeyList.js.map