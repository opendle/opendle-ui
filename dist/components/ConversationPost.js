import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from "react";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
/** The text of the post: the first lines, and all lines on request. */
function PostText({ lessLabel, moreLabel, text, }) {
    const textRef = useRef(null);
    const [expanded, setExpanded] = useState(false);
    const [long, setLong] = useState(false);
    // Measure again when the size changes: the styles or the width can come
    // after the first layout.
    useLayoutEffect(() => {
        const element = textRef.current;
        if (element === null || expanded)
            return undefined;
        const measure = () => {
            setLong(element.scrollHeight > element.clientHeight + 1);
        };
        measure();
        if (typeof ResizeObserver === "undefined")
            return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => {
            observer.disconnect();
        };
    }, [expanded, text]);
    return (_jsxs(_Fragment, { children: [_jsx("p", { className: "od-conversation-post-text", "data-expanded": expanded, ref: textRef, children: text }), long ? (_jsx("button", { "aria-expanded": expanded, className: "od-conversation-post-more", onClick: () => {
                    setExpanded((value) => !value);
                }, type: "button", children: expanded ? lessLabel : moreLabel })) : null] }));
}
const noStats = [];
/** The post at the top of a conversation. */
export function ConversationPost({ className, lessLabel = "Less", moreLabel = "More", network, openLabel = "Open", stats = noStats, text = "", thumbnail = null, title, url = null, when, }) {
    return (_jsxs("article", { className: classes("od-conversation-post", className), children: [thumbnail === null ? null : (_jsx("img", { alt: "", className: "od-conversation-post-media", src: thumbnail })), _jsxs("div", { className: "od-conversation-post-body", children: [_jsxs("div", { className: "od-conversation-post-head", children: [_jsx(NetworkIcon, { network: network }), _jsx("strong", { children: title }), when === undefined ? null : _jsx("time", { children: when }), url === null ? null : (_jsx("a", { "aria-label": openLabel, className: "od-conversation-post-link", href: url, rel: "noreferrer", target: "_blank", title: openLabel, children: _jsx(Icon, { name: "external-link", size: 14 }) }))] }), text === "" ? null : (_jsx(PostText, { lessLabel: lessLabel, moreLabel: moreLabel, text: text }, text)), stats.length === 0 ? null : (_jsx("p", { className: "od-conversation-post-stats", children: stats.map((stat) => (_jsx("span", { children: stat }, stat))) }))] })] }));
}
//# sourceMappingURL=ConversationPost.js.map