import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
const noStats = [];
/** The post at the top of a conversation. */
export function ConversationPost({ className, network, openLabel = "Open", stats = noStats, text = "", thumbnail = null, title, url = null, when, }) {
    return (_jsxs("article", { className: classes("od-conversation-post", className), children: [thumbnail === null ? null : (_jsx("img", { alt: "", className: "od-conversation-post-media", src: thumbnail })), _jsxs("div", { className: "od-conversation-post-body", children: [_jsxs("div", { className: "od-conversation-post-head", children: [_jsx(NetworkIcon, { network: network }), _jsx("strong", { children: title }), when === undefined ? null : _jsx("time", { children: when }), url === null ? null : (_jsx("a", { "aria-label": openLabel, className: "od-conversation-post-link", href: url, rel: "noreferrer", target: "_blank", title: openLabel, children: _jsx(Icon, { name: "external-link", size: 14 }) }))] }), text === "" ? null : _jsx("p", { children: text }), stats.length === 0 ? null : (_jsx("p", { className: "od-conversation-post-stats", children: stats.map((stat) => (_jsx("span", { children: stat }, stat))) }))] })] }));
}
//# sourceMappingURL=ConversationPost.js.map