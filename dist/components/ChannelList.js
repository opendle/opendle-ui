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
import { LoadingIndicator } from "./LoadingIndicator.js";
import { Section } from "./Section.js";
import { useAsyncAction } from "./useAsyncAction.js";
const noConnectionProviders = [];
/**
 * The connected accounts of the networks: name, tags, switches, the warning
 * for an ended authorization, and the connect and disconnect actions.
 */
export function ChannelList({ connectOpen, onConnectOpenChange, connectionProviders = noConnectionProviders, disconnectConfirmation, errorMessage, items, labels = channelListLabels, loading = false, networks, onDisconnect, onError, onPasswordConnect, onPasswordReconnect, onRename, onSwitchChange, onTagsChange, readOnly = false, tagColors, tagSuggestions, }) {
    const change = useAsyncAction(errorMessage, onError);
    const removal = useAsyncAction(errorMessage, onError);
    const [connection, setConnection] = useState(null);
    const [removing, setRemoving] = useState(null);
    const { run } = change;
    const guarded = async (work) => {
        const done = await run(work);
        if (!done)
            throw new Error("The channel change was not stored.");
    };
    const reconnectOf = (item) => {
        if (item.connectionProvider !== undefined) {
            const provider = connectionProviders.find((entry) => entry.id === item.connectionProvider);
            if (provider === undefined)
                return null;
            return () => {
                if (provider.onReconnect === undefined)
                    provider.onSelect();
                else
                    provider.onReconnect(item);
            };
        }
        const network = networks.find((entry) => entry.network === item.network);
        const href = item.reconnectHref ?? network?.href;
        if (href !== undefined)
            return { href };
        if (network === undefined)
            return null;
        return () => {
            setConnection({ network: item.network, item });
            onConnectOpenChange?.(true);
        };
    };
    const reconnecting = connection?.item;
    // Each switch has one column, so the switches of all rows align.
    const switchIds = [
        ...new Set(items.flatMap((item) => item.switches.map(({ id }) => id))),
    ];
    const confirmation = removing === null
        ? null
        : (disconnectConfirmation?.(removing) ?? {
            title: labels.disconnectTitle,
            description: removing.name,
        });
    return (_jsxs(Section, { actions: readOnly ||
            (networks.length === 0 && connectionProviders.length === 0) ? null : (_jsx(Button, { icon: _jsx(Icon, { name: "plus", size: 15 }), onClick: () => {
                setConnection({ network: null });
                onConnectOpenChange?.(true);
            }, variant: "secondary", children: labels.connect })), title: labels.title, children: [change.failure === null ? null : (_jsx(InlineAlert, { className: "od-section-alert", tone: "error", children: change.failure })), _jsx(Card, { children: items.length === 0 && loading ? (_jsx(LoadingIndicator, { block: true, label: labels.loading })) : items.length === 0 ? (_jsx("p", { className: "od-list-empty", children: labels.empty })) : (_jsx("div", { className: "od-channel-table", children: _jsx("ul", { className: "od-channel-list", style: {
                            "--od-channel-switch-columns": Math.max(1, switchIds.length),
                        }, children: items.map((item) => (_jsx(ChannelRow, { switchIds: switchIds, item: item, labels: labels, onDisconnect: setRemoving, onRename: (name) => guarded(() => onRename(item.id, name)), onSwitchChange: (switchId, on) => {
                                void run(() => onSwitchChange(item.id, switchId, on));
                            }, onTagsChange: (tags) => {
                                void run(() => onTagsChange(item.id, tags));
                            }, readOnly: readOnly, reconnect: reconnectOf(item), tagColors: tagColors, tagSuggestions: tagSuggestions }, item.id))) }) })) }), _jsx(ConnectChannelDialog, { connectionProviders: connectionProviders, errorMessage: errorMessage, ...(onError === undefined ? {} : { onError }), labels: labels, network: connection?.network ?? null, networks: networks, onClose: () => {
                    setConnection(null);
                    onConnectOpenChange?.(false);
                }, onPasswordConnect: reconnecting === undefined || onPasswordReconnect === undefined
                    ? onPasswordConnect
                    : (_network, handle, password) => onPasswordReconnect(reconnecting.id, handle, password), open: !readOnly && (connectOpen ?? connection !== null), ...(reconnecting === undefined
                    ? {}
                    : {
                        handle: reconnecting.handle,
                        title: `${labels.reconnect} ${reconnecting.name}`,
                    }) }, reconnecting?.id ?? ""), _jsx(ConfirmationDialog, { cancelLabel: labels.cancel, confirmLabel: labels.disconnect, description: confirmation?.description ?? "", error: removal.failure, onCancel: () => {
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
                }, open: removing !== null, pending: removal.pending, pendingLabel: labels.disconnect, title: confirmation?.title ?? labels.disconnectTitle, tone: "danger" })] }));
}
//# sourceMappingURL=ChannelList.js.map