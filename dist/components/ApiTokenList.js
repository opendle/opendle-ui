import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { DateTime } from "./DateTime.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { CreateTokenDialog } from "./CreateTokenDialog.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { apiTokenListLabels, } from "./identityLabels.js";
import { ItemList } from "./ItemList.js";
import { ItemRow } from "./ItemRow.js";
import { Section } from "./Section.js";
import { useAsyncAction } from "./useAsyncAction.js";
const dateFormat = { dateStyle: "medium" };
const keyIcon = _jsx(Icon, { name: "key" });
function TokenRow({ item, labels, onRevoke }) {
    const meta = useMemo(() => (_jsxs(_Fragment, { children: [labels.created, " ", _jsx(DateTime, { format: dateFormat, value: item.createdAt }), item.expiresAt ? (_jsxs(_Fragment, { children: [" · ", labels.expires, " ", _jsx(DateTime, { format: dateFormat, value: item.expiresAt })] })) : null] })), [item, labels]);
    const actions = useMemo(() => (_jsx(IconButton, { icon: _jsx(Icon, { name: "trash" }), label: `${labels.revoke}: ${item.name}`, onClick: () => {
            onRevoke(item);
        }, tone: "danger" })), [item, labels, onRevoke]);
    return (_jsx(ItemRow, { actions: actions, icon: keyIcon, meta: meta, title: item.name }));
}
/** The API tokens of one account, with create, reveal-once and revoke. */
export function ApiTokenList({ errorMessage, items, labels = apiTokenListLabels, onCreate, onRevoke, }) {
    const [creating, setCreating] = useState(false);
    const [revoking, setRevoking] = useState(null);
    const revoke = useAsyncAction(errorMessage);
    const closeRevoke = () => {
        revoke.reset();
        setRevoking(null);
    };
    const create = (_jsx(Button, { icon: _jsx(Icon, { name: "plus", size: 15 }), onClick: () => {
            setCreating(true);
        }, variant: "secondary", children: labels.create }));
    return (_jsxs(Section, { actions: create, title: labels.title, children: [_jsx(Card, { children: _jsx(ItemList, { empty: labels.empty, children: items.map((item) => (_jsx(TokenRow, { item: item, labels: labels, onRevoke: setRevoking }, item.id))) }) }), _jsx(CreateTokenDialog, { errorMessage: errorMessage, labels: labels, onClose: () => {
                    setCreating(false);
                }, onCreate: onCreate, open: creating }), _jsx(ConfirmationDialog, { cancelLabel: labels.cancel, confirmLabel: labels.revoke, description: revoking?.name ?? "", error: revoke.failure, onCancel: closeRevoke, onConfirm: () => {
                    if (revoking === null)
                        return;
                    void revoke
                        .run(() => onRevoke(revoking.id))
                        .then((done) => {
                        if (done)
                            setRevoking(null);
                    });
                }, open: revoking !== null, pending: revoke.pending, pendingLabel: labels.revoke, title: labels.revokeTitle, tone: "danger" })] }));
}
//# sourceMappingURL=ApiTokenList.js.map