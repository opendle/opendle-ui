import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { ChannelAvatar } from "./ChannelAvatar.js";
import { classes } from "./classes.js";
/**
 * A pill with the channel picture, its network badge and its name. With
 * `onClick`, the chip is a button; with `pressed`, it is a toggle button.
 * Without them, it is static text.
 */
export function ChannelChip({ avatarUrl, children, className, invalid = false, name, network, pressed, ...props }) {
    const content = (_jsxs(_Fragment, { children: [_jsx(ChannelAvatar, { name: name, network: network, src: avatarUrl }), _jsx("span", { className: "od-channel-chip-name", children: name }), children] }));
    if (props.onClick === undefined && pressed === undefined)
        return (_jsx("span", { className: classes("od-channel-chip", className), "data-invalid": invalid || undefined, title: props.title, children: content }));
    return (_jsx("button", { "aria-pressed": pressed, className: classes("od-channel-chip", className), "data-invalid": invalid || undefined, ...props, type: "button", children: content }));
}
//# sourceMappingURL=ChannelChip.js.map