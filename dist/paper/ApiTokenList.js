import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { DateTime } from "../components/DateTime.js";
import { Button, IconButton } from "./Button.js";
import { CreateTokenDialog } from "./CreateTokenDialog.js";
import { ConfirmDialog } from "./Dialog.js";
import { Icon } from "./Icon.js";
import { apiTokenListLabels } from "./labels.js";
import { Card, ItemList, ItemRow, Section } from "./Page.js";
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
    const create = (_jsx(Button, { icon: _jsx(Icon, { name: "plus", size: 15 }), onClick: () => {
            setCreating(true);
        }, children: labels.create }));
    return (_jsxs(Section, { actions: create, title: labels.title, children: [_jsx(Card, { children: _jsx(ItemList, { empty: labels.empty, children: items.map((item) => (_jsx(TokenRow, { item: item, labels: labels, onRevoke: setRevoking }, item.id))) }) }), _jsx(CreateTokenDialog, { errorMessage: errorMessage, labels: labels, onClose: () => {
                    setCreating(false);
                }, onCreate: onCreate, open: creating }), _jsx(ConfirmDialog, { cancelLabel: labels.cancel, closeLabel: labels.close, confirmLabel: labels.revoke, errorMessage: errorMessage, onClose: () => {
                    setRevoking(null);
                }, onConfirm: () => revoking === null ? Promise.resolve() : onRevoke(revoking.id), open: revoking !== null, title: labels.revokeTitle, tone: "danger", children: _jsx("p", { children: revoking?.name }) })] }));
}
//# sourceMappingURL=ApiTokenList.js.map