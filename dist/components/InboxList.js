import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { NetworkIcon } from "./Icon.js";
/** The messages of an inbox, newest first. Each row is a link. */
export function InboxList({ className, empty, items, label, moreLabel = "Older", onLoadMore, onOpen, selectedId = null, }) {
    if (items.length === 0) {
        return _jsx("p", { className: "od-inbox-empty", children: empty });
    }
    return (_jsxs("nav", { "aria-label": label, className: classes("od-inbox", className), children: [items.map((item) => (_jsxs("a", { "aria-current": item.id === selectedId ? "true" : undefined, className: "od-inbox-row", href: item.href, onClick: (event) => {
                    onOpen?.(item, event);
                }, children: [_jsxs("span", { className: "od-inbox-avatar", children: [_jsx(Avatar, { name: item.authorName, src: item.avatarUrl }), _jsx(NetworkIcon, { badge: true, network: item.network })] }), _jsxs("span", { className: "od-inbox-copy", children: [_jsxs("span", { className: "od-inbox-head", children: [_jsx("strong", { children: item.authorName }), _jsx("time", { dateTime: item.createdAt, children: item.when })] }), _jsx("span", { className: "od-inbox-text", children: item.text }), item.context ? (_jsx("span", { className: "od-inbox-context", children: item.context })) : null] })] }, item.id))), onLoadMore === undefined ? null : (_jsx("button", { className: "od-calendar-more", onClick: onLoadMore, type: "button", children: moreLabel }))] }));
}
//# sourceMappingURL=InboxList.js.map