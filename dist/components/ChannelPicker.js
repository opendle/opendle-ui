import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { TagChip } from "./TagChip.js";
/**
 * A multiple choice of channels. Each channel is a toggle button with its
 * picture, its network mark and its name. Optional groups above the channels
 * select a set of channels in one click.
 */
export function ChannelPicker({ className, disabled = false, groups, groupsLabel = "Groups", invalid, items, label, onChange, value, }) {
    const selected = new Set(value);
    const enabled = new Set(items.flatMap((item) => (item.disabled === true ? [] : [item.id])));
    const ordered = (next) => items.flatMap((item) => (next.has(item.id) ? [item.id] : []));
    const toggle = (id) => {
        const next = new Set(selected);
        if (next.has(id))
            next.delete(id);
        else
            next.add(id);
        onChange(ordered(next));
    };
    const shortcuts = (groups ?? []).flatMap((group) => {
        const ids = group.channelIds.filter((id) => enabled.has(id));
        if (ids.length === 0)
            return [];
        const pressed = group.pressed ?? ids.every((id) => selected.has(id));
        return [{ group, ids, pressed }];
    });
    const choose = (id, ids, pressed) => {
        const next = new Set(selected);
        for (const channelId of ids) {
            if (pressed)
                next.add(channelId);
            else
                next.delete(channelId);
        }
        onChange(ordered(next), { id, pressed });
    };
    return (_jsxs("fieldset", { className: classes("od-channel-picker", className), disabled: disabled, children: [_jsx("legend", { className: "od-visually-hidden", children: label }), shortcuts.length === 0 ? null : (_jsx("fieldset", { "aria-label": groupsLabel, className: "od-channel-picker-groups", children: shortcuts.map(({ group, ids, pressed }) => (_jsx(TagChip, { color: group.color, disabled: disabled, onPressedChange: (next) => {
                        choose(group.id, ids, next);
                    }, pressed: pressed, children: group.label }, group.id))) })), items.map((item) => {
                const pressed = selected.has(item.id);
                const warning = pressed && invalid?.has(item.id) === true;
                return (_jsxs("button", { "aria-pressed": pressed, className: "od-channel-picker-item", "data-invalid": warning || undefined, disabled: item.disabled, onClick: () => {
                        toggle(item.id);
                    }, title: item.detail, type: "button", children: [_jsxs("span", { className: "od-channel-picker-picture", children: [_jsx(Avatar, { name: item.name, shape: "circle", src: item.avatarUrl }), _jsx(NetworkIcon, { badge: true, network: item.network })] }), _jsx("span", { className: "od-channel-picker-name", children: item.name }), _jsx("span", { "aria-hidden": "true", className: "od-channel-picker-mark", children: _jsx(Icon, { name: warning ? "alert" : "check", size: 12 }) })] }, item.id));
            })] }));
}
//# sourceMappingURL=ChannelPicker.js.map