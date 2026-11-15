import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { channelListLabels, } from "./channelLabels.js";
import { ChannelRow } from "./ChannelRow.js";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { ConnectChannelDialog } from "./ConnectChannelDialog.js";
import { Icon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import { Section } from "./Section.js";
import { useAsyncAction } from "./useAsyncAction.js";
const noConnectionProviders = [];
/**
 * The connected accounts of the networks: name, tags, switches, the warning
 * for an ended authorization, and the connect and disconnect actions.
 */
export function ChannelList({ connectOpen, onConnectOpenChange, connectionProviders = noConnectionProviders, errorMessage, items, labels = channelListLabels, networks, onDisconnect, onPasswordConnect, onRename, onSwitchChange, onTagsChange, readOnly = false, tagColors, }) {
    const change = useAsyncAction(errorMessage);
    const removal = useAsyncAction(errorMessage);
    const [connection, setConnection] = useState(null);
    const [removing, setRemoving] = useState(null);
    const { run } = change;
    const guarded = async (work) => {
        const done = await run(work);
        if (!done)
            throw new Error("The channel change was not stored.");
    };
    return (_jsxs(Section, { actions: readOnly ||
            (networks.length === 0 && connectionProviders.length === 0) ? null : (_jsx(Button, { icon: _jsx(Icon, { name: "plus", size: 15 }), onClick: () => {
                setConnection({ network: null });
                onConnectOpenChange?.(true);
            }, variant: "secondary", children: labels.connect })), title: labels.title, children: [change.failure === null ? null : (_jsx(InlineAlert, { className: "od-section-alert", tone: "error", children: change.failure })), _jsx(Card, { children: items.length === 0 ? (_jsx("p", { className: "od-list-empty", children: labels.empty })) : (_jsx("ul", { className: "od-channel-list", children: items.map((item) => (_jsx(ChannelRow, { item: item, labels: labels, onDisconnect: setRemoving, onReconnect: (network) => {
                            const provider = connectionProviders.find((entry) => entry.id === item.connectionProvider);
                            if (provider !== undefined)
                                provider.onSelect();
                            else {
                                setConnection({
                                    network: item.connectionProvider === undefined ? network : null,
                                });
                                onConnectOpenChange?.(true);
                            }
                        }, onRename: (name) => guarded(() => onRename(item.id, name)), onSwitchChange: (switchId, on) => {
                            void run(() => onSwitchChange(item.id, switchId, on));
                        }, onTagsChange: (tags) => {
                            void run(() => onTagsChange(item.id, tags));
                        }, readOnly: readOnly, tagColors: tagColors, reconnectHref: item.connectionProvider === undefined
                            ? (networks.find((entry) => entry.network === item.network)
                                ?.href ?? null)
                            : null }, item.id))) })) }), _jsx(ConnectChannelDialog, { connectionProviders: connectionProviders, errorMessage: errorMessage, labels: labels, network: connection?.network ?? null, networks: networks, onClose: () => {
                    setConnection(null);
                    onConnectOpenChange?.(false);
                }, onPasswordConnect: onPasswordConnect, open: !readOnly && (connectOpen ?? connection !== null) }), _jsx(ConfirmationDialog, { cancelLabel: labels.cancel, confirmLabel: labels.disconnect, description: removing?.name ?? "", error: removal.failure, onCancel: () => {
                    removal.reset();
                    setRemoving(null);
                }, onConfirm: () => {
                    if (removing === null)
                        return;
                    void removal
                        .run(() => onDisconnect(removing.id))
                        .then((done) => {
                        if (done)
                            setRemoving(null);
                    });
                }, open: removing !== null, pending: removal.pending, pendingLabel: labels.disconnect, title: labels.disconnectTitle, tone: "danger" })] }));
}
//# sourceMappingURL=ChannelList.js.map