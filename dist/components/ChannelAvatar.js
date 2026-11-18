import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { NetworkIcon } from "./Icon.js";
/**
 * The round picture of a channel with the badge of its network at the bottom
 * right. The network name is the accessible name of the badge.
 */
export function ChannelAvatar({ className, name, network, size = "default", src, }) {
    return (_jsxs("span", { className: classes("od-channel-avatar", className), "data-size": size === "default" ? undefined : size, children: [_jsx(Avatar, { name: name, shape: "circle", src: src }), _jsx(NetworkIcon, { badge: true, network: network })] }));
}
//# sourceMappingURL=ChannelAvatar.js.map