import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { NetworkIcon } from "./Icon.js";
function InboxRow({ grouped = false, item, onOpen, selectedId, }) {
    return (_jsxs("a", { "aria-current": item.id === selectedId ? "true" : undefined, className: "od-inbox-row", href: item.href, onClick: (event) => {
            onOpen?.(item, event);
        }, children: [_jsxs("span", { className: "od-inbox-avatar", children: [_jsx(Avatar, { name: item.authorName, src: item.avatarUrl }), _jsx(NetworkIcon, { badge: true, network: item.network })] }), _jsxs("span", { className: "od-inbox-copy", children: [_jsxs("span", { className: "od-inbox-head", children: [_jsx("strong", { children: item.authorName }), item.status ? (_jsx("span", { className: "od-inbox-status", children: item.status })) : null, _jsx("time", { dateTime: item.createdAt, children: item.when })] }), _jsx("span", { className: "od-inbox-text", children: item.text }), !grouped && item.context ? (_jsx("span", { className: "od-inbox-context", children: item.context })) : null] })] }));
}
/** The messages of an inbox. Optional post cards keep related rows together. */
export function InboxList({ className, empty, groups, items, label, moreLabel = "Older", onLoadMore, onOpen, selectedId = null, }) {
    if (groups === undefined ? items.length === 0 : groups.length === 0) {
        return _jsx("p", { className: "od-inbox-empty", children: empty });
    }
    return (_jsxs("nav", { "aria-label": label, className: classes("od-inbox", className), children: [groups === undefined
                ? items.map((item) => (_jsx(InboxRow, { item: item, onOpen: onOpen, selectedId: selectedId }, item.id)))
                : groups.map((group) => {
                    const first = group.items[0];
                    if (first === undefined)
                        return null;
                    const networks = [
                        ...new Set(group.items.map((item) => item.network)),
                    ];
                    return (_jsxs("section", { "aria-label": group.title, className: "od-inbox-group", children: [_jsxs("a", { className: "od-inbox-group-post", href: first.href, onClick: (event) => {
                                    onOpen?.(first, event);
                                }, children: [group.thumbnailUrl ? (_jsx("img", { alt: "", loading: "lazy", src: group.thumbnailUrl })) : null, _jsx("span", { className: "od-inbox-group-title", children: group.title }), _jsx("span", { className: "od-inbox-group-networks", children: networks.map((network) => (_jsx(NetworkIcon, { network: network }, network))) })] }), _jsx("div", { className: "od-inbox-group-comments", children: group.items.map((item) => (_jsx(InboxRow, { grouped: true, item: item, onOpen: onOpen, selectedId: selectedId }, item.id))) })] }, group.id));
                }), onLoadMore === undefined ? null : (_jsx("button", { className: "od-calendar-more", onClick: onLoadMore, type: "button", children: moreLabel }))] }));
}
//# sourceMappingURL=InboxList.js.map