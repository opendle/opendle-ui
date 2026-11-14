import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./Button.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { InlineEditableText } from "./InlineEditableText.js";
import { TagChip } from "./TagChip.js";
import { TagInput } from "./TagInput.js";
/** One connected account in a `ChannelList`. */
export function ChannelRow({ item, labels, onDisconnect, onReconnect, onRename, onSwitchChange, onTagsChange, readOnly, reconnectHref, }) {
    return (_jsxs("li", { className: "od-channel-row", "data-warning": item.needsReconnect, children: [_jsx(NetworkIcon, { badge: true, className: "od-channel-mark", network: item.network }), _jsxs("span", { className: "od-channel-identity", children: [_jsx("span", { className: "od-channel-name", children: readOnly ? (item.name) : (_jsx(InlineEditableText, { label: `${labels.rename}: ${item.name}`, maxLength: 100, onSave: onRename, value: item.name })) }), _jsx("span", { className: "od-channel-handle", children: item.needsReconnect ? (_jsxs("span", { className: "od-channel-warning", children: [_jsx(Icon, { name: "alert", size: 13 }), labels.reconnectNeeded] })) : (item.handle) })] }), _jsx(TagInput, { className: "od-channel-tags", disabled: readOnly, label: `${labels.tags}: ${item.name}`, onChange: onTagsChange, placeholder: labels.addTag, removeLabel: labels.removeTag, value: item.tags }), _jsx("span", { className: "od-channel-switches", children: item.switches.map((entry) => readOnly ? (entry.on ? (_jsx(TagChip, { children: entry.label }, entry.id)) : null) : (_jsx(TagChip, { onPressedChange: (on) => {
                        onSwitchChange(entry.id, on);
                    }, pressed: entry.on, children: entry.label }, entry.id))) }), readOnly ? null : (_jsxs("span", { className: "od-channel-actions", children: [!item.needsReconnect ? null : reconnectHref === null ? (_jsx(Button, { onClick: () => {
                            onReconnect(item.network);
                        }, size: "small", variant: "secondary", children: labels.reconnect })) : (_jsx("a", { className: "od-button od-button-secondary", "data-size": "small", href: reconnectHref, children: labels.reconnect })), _jsx(IconButton, { icon: _jsx(Icon, { name: "trash" }), label: `${labels.disconnect}: ${item.name}`, onClick: () => {
                            onDisconnect(item);
                        }, tone: "danger" })] }))] }));
}
//# sourceMappingURL=ChannelRow.js.map