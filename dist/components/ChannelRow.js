import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { ActionMenu } from "./ActionMenu.js";
import { Button } from "./Button.js";
import { formatAge } from "./formatAge.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { InlineEditableText } from "./InlineEditableText.js";
import { TagChip } from "./TagChip.js";
import { TagInput } from "./TagInput.js";
import { useMinute } from "./useMinute.js";
/** A switch that shows its last read: it is supported and visible. */
function hasSync(entry, readOnly) {
    return (entry?.sync !== undefined &&
        entry.disabled !== true &&
        !(readOnly && !entry.on));
}
/** The age of the last read of one function, and its read button. */
function SyncLine({ at, channelName, entry, labels, onRefresh, pending, }) {
    const now = useMinute();
    const date = at === null ? null : new Date(at);
    const valid = date !== null && !Number.isNaN(date.getTime());
    const fullDate = useMemo(() => new Intl.DateTimeFormat(undefined, {
        dateStyle: "full",
        timeStyle: "short",
    }), []);
    return (_jsxs("span", { className: "od-channel-sync", children: [valid ? (_jsxs("time", { dateTime: date.toISOString(), title: `${labels.lastRead}: ${fullDate.format(date)}`, children: [_jsx("span", { className: "od-visually-hidden", children: `${labels.lastRead}: ` }), formatAge(date, now)] })) : (_jsx("span", { children: labels.neverRead })), onRefresh === null ? null : (_jsx(IconButton, { "aria-busy": pending || undefined, "aria-disabled": pending || undefined, className: "od-channel-sync-button", "data-pending": pending || undefined, icon: _jsx(Icon, { name: "refresh", size: 13 }), label: `${labels.readNow}: ${entry.label}, ${channelName}`, onClick: () => {
                    if (!pending)
                        onRefresh();
                } }))] }));
}
/**
 * One switch in its column, with the age of its last read below it. A row
 * without the switch, or a read-only switch that is off, keeps an empty cell.
 */
function SwitchCell({ entry, onChange, readOnly, sync, syncRow, }) {
    if (entry === undefined || (readOnly && !entry.on)) {
        return _jsx("span", { "aria-hidden": "true", className: "od-channel-switch-gap" });
    }
    const chip = (_jsx(SwitchChip, { entry: entry, onChange: onChange, readOnly: readOnly }));
    if (!syncRow)
        return chip;
    return (_jsxs("span", { className: "od-channel-switch-cell", children: [chip, sync !== null && entry.sync !== undefined && hasSync(entry, readOnly) ? (_jsx(SyncLine, { ...sync, at: entry.sync.at, entry: entry })) : null] }));
}
function SwitchChip({ entry, onChange, readOnly, }) {
    const content = (_jsxs(_Fragment, { children: [entry.icon === undefined ? null : (_jsx("span", { className: "od-channel-switch-icon", children: _jsx(Icon, { name: entry.icon, size: 14 }) })), _jsx("span", { className: "od-channel-switch-label", children: entry.label })] }));
    const unavailable = entry.disabled ?? false;
    const title = unavailable ? entry.disabledReason : entry.description;
    if (readOnly) {
        return (_jsx(TagChip, { className: "od-channel-switch", title: title, children: content }));
    }
    return (_jsx(TagChip, { className: "od-channel-switch", unavailable: unavailable, title: title, onPressedChange: (on) => {
            onChange(entry.id, on);
        }, pressed: entry.on, children: content }));
}
/** One connected account in a `ChannelList`. */
export function ChannelRow({ item, labels, onDisconnect, onRename, onSwitchChange, onSwitchRefresh, onTagsChange, readOnly, reconnect, refreshing, switchIds, tagColors, tagSuggestions, }) {
    const actions = [
        ...(reconnect === null
            ? []
            : [
                {
                    id: "reconnect",
                    label: labels.reconnect,
                    icon: _jsx(Icon, { name: "retry", size: 15 }),
                    ...(typeof reconnect === "function"
                        ? { onSelect: reconnect }
                        : { href: reconnect.href }),
                },
            ]),
        {
            id: "disconnect",
            label: labels.disconnect,
            icon: _jsx(Icon, { name: "trash", size: 15 }),
            tone: "danger",
            onSelect: () => {
                onDisconnect(item);
            },
        },
    ];
    const syncRow = item.switches.some((entry) => hasSync(entry, readOnly));
    const refresh = readOnly || item.needsReconnect || onSwitchRefresh === undefined
        ? null
        : onSwitchRefresh;
    return (_jsxs("li", { className: "od-channel-row", "data-warning": item.needsReconnect, children: [_jsx(NetworkIcon, { badge: true, className: "od-channel-mark", network: item.network }), _jsxs("span", { className: "od-channel-identity", children: [_jsx("span", { className: "od-channel-name", children: readOnly ? (item.name) : (_jsx(InlineEditableText, { label: `${labels.rename}: ${item.name}`, maxLength: 100, onSave: onRename, value: item.name })) }), _jsxs("span", { className: "od-channel-details", children: [_jsx("span", { className: "od-channel-handle", children: item.needsReconnect ? (_jsxs("span", { className: "od-channel-warning", children: [_jsx(Icon, { name: "alert", size: 13 }), labels.reconnectNeeded] })) : (item.handle) }), item.connectionLabel ? (_jsx("span", { className: "od-channel-provider", children: item.connectionLabel })) : null] })] }), _jsx(TagInput, { className: "od-channel-tags", ...(tagColors === undefined ? {} : { colors: tagColors }), ...(tagSuggestions === undefined
                    ? {}
                    : { suggestions: tagSuggestions }), addLabel: labels.addTag, disabled: readOnly, label: `${labels.tags}: ${item.name}`, onChange: onTagsChange, removeLabel: labels.removeTag, value: item.tags }), _jsx("span", { className: "od-channel-switches", children: switchIds.map((id) => (_jsx(SwitchCell, { entry: item.switches.find((entry) => entry.id === id), onChange: onSwitchChange, readOnly: readOnly, sync: {
                        channelName: item.name,
                        labels,
                        onRefresh: refresh === null
                            ? null
                            : () => {
                                refresh(id);
                            },
                        pending: refreshing.has(id),
                    }, syncRow: syncRow }, id))) }), readOnly ? null : (_jsxs("span", { className: "od-channel-actions", children: [!item.needsReconnect ||
                        reconnect === null ? null : typeof reconnect === "function" ? (_jsx(Button, { onClick: reconnect, size: "small", variant: "secondary", children: labels.reconnect })) : (_jsx("a", { className: "od-button od-button-secondary", "data-size": "small", href: reconnect.href, children: labels.reconnect })), _jsx(ActionMenu, { items: actions, label: `${labels.moreActions}: ${item.name}` })] }))] }));
}
//# sourceMappingURL=ChannelRow.js.map