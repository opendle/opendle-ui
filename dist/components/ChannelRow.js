import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ActionMenu } from "./ActionMenu.js";
import { Button } from "./Button.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { InlineEditableText } from "./InlineEditableText.js";
import { TagChip } from "./TagChip.js";
import { TagInput } from "./TagInput.js";
/** One connected account in a `ChannelList`. */
export function ChannelRow({ item, labels, onDisconnect, onRename, onSwitchChange, onTagsChange, readOnly, reconnect, tagColors, }) {
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
    return (_jsxs("li", { className: "od-channel-row", "data-warning": item.needsReconnect, children: [_jsx(NetworkIcon, { badge: true, className: "od-channel-mark", network: item.network }), _jsxs("span", { className: "od-channel-identity", children: [_jsx("span", { className: "od-channel-name", children: readOnly ? (item.name) : (_jsx(InlineEditableText, { label: `${labels.rename}: ${item.name}`, maxLength: 100, onSave: onRename, value: item.name })) }), _jsxs("span", { className: "od-channel-details", children: [_jsx("span", { className: "od-channel-handle", children: item.needsReconnect ? (_jsxs("span", { className: "od-channel-warning", children: [_jsx(Icon, { name: "alert", size: 13 }), labels.reconnectNeeded] })) : (item.handle) }), item.connectionLabel ? (_jsx("span", { className: "od-channel-provider", children: item.connectionLabel })) : null] })] }), _jsx(TagInput, { className: "od-channel-tags", ...(tagColors === undefined ? {} : { colors: tagColors }), disabled: readOnly, label: `${labels.tags}: ${item.name}`, onChange: onTagsChange, placeholder: labels.addTag, removeLabel: labels.removeTag, value: item.tags }), _jsx("span", { className: "od-channel-switches", children: item.switches.map((entry) => readOnly ? (entry.on ? (_jsx(TagChip, { children: entry.label }, entry.id)) : null) : (_jsx(TagChip, { disabled: entry.disabled ?? false, title: entry.disabledReason, onPressedChange: (on) => {
                        onSwitchChange(entry.id, on);
                    }, pressed: entry.on, children: entry.label }, entry.id))) }), readOnly ? null : (_jsxs("span", { className: "od-channel-actions", children: [!item.needsReconnect ||
                        reconnect === null ? null : typeof reconnect === "function" ? (_jsx(Button, { onClick: reconnect, size: "small", variant: "secondary", children: labels.reconnect })) : (_jsx("a", { className: "od-button od-button-secondary", "data-size": "small", href: reconnect.href, children: labels.reconnect })), _jsx(ActionMenu, { items: actions, label: `${labels.moreActions}: ${item.name}` })] }))] }));
}
//# sourceMappingURL=ChannelRow.js.map