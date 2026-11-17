import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { networkLabel } from "./networks.js";
import { socialPreviewLabels, } from "./socialPreviewLabels.js";
const layouts = {
    instagram: "photo",
    pinterest: "pin",
    youtube: "video",
    tiktok: "vertical",
};
const entity = /(https?:\/\/[^\s]+|[#@][\p{L}\p{N}_.]*[\p{L}\p{N}_])/u;
/** The text with links, hashtags and mentions marked. */
function RichText({ text }) {
    const parts = text.split(entity);
    return (_jsx(_Fragment, { children: parts.map((part, index) => index % 2 === 1 ? (_jsx("span", { className: "od-social-entity", children: part }, `${String(index)}:${part}`)) : (_jsx(Fragment, { children: part }, `${String(index)}:${part}`))) }));
}
function Picture({ item, labels, }) {
    if (item === undefined)
        return (_jsxs("span", { className: "od-social-media-empty", children: [_jsx(Icon, { name: "image", size: 22 }), labels.noMedia] }));
    return (_jsxs(_Fragment, { children: [item.src === null ? (_jsx("span", { className: "od-social-media-empty", children: _jsx(Icon, { name: item.kind === "video" ? "play" : "image", size: 22 }) })) : (_jsx("img", { alt: "", src: item.src })), item.kind === "video" ? (_jsx("span", { className: "od-social-play", children: _jsx(Icon, { name: "play", size: 18 }) })) : null] }));
}
function MediaGrid({ labels, media, }) {
    if (media.length === 0)
        return null;
    const shown = media.slice(0, 4);
    return (_jsx("div", { className: "od-social-grid", "data-count": shown.length, children: shown.map((item, index) => (_jsxs("span", { className: "od-social-media", children: [_jsx(Picture, { item: item, labels: labels }), index === 3 && media.length > 4 ? (_jsx("span", { className: "od-social-more", children: `+${String(media.length - 4)}` })) : null] }, item.id))) }));
}
/**
 * An approximate view of a post as a network shows it: the account, the text
 * and the media in the layout of that network. It is a preview, not a copy.
 */
export function SocialPostPreview({ avatarUrl, className, handle, labels = socialPreviewLabels, layout, media, name, network, text, time, title = "", vertical = false, }) {
    const shape = layout ?? layouts[network] ?? "feed";
    const shownHandle = handle === undefined || handle === "" ? name : handle;
    const account = (_jsxs("span", { className: "od-social-account", children: [_jsx(Avatar, { name: name, shape: "circle", src: avatarUrl }), _jsxs("span", { className: "od-social-names", children: [_jsx("strong", { children: name }), handle === undefined || handle === "" ? null : (_jsx("span", { children: `@${handle}` })), time === undefined ? null : _jsx("span", { children: time })] }), _jsx(NetworkIcon, { className: "od-social-network", network: network })] }));
    const body = text.trim() === "" ? null : (_jsx("p", { className: "od-social-text", children: _jsx(RichText, { text: text }) }));
    const first = media[0];
    return (_jsx("article", { "aria-label": `${labels.preview}: ${networkLabel(network)} · ${name}`, className: classes("od-social-preview", className), "data-layout": shape, "data-network": network, "data-vertical": vertical || undefined, children: shape === "feed" ? (_jsxs(_Fragment, { children: [account, title === "" ? null : _jsx("p", { className: "od-social-title", children: title }), body, _jsx(MediaGrid, { labels: labels, media: media })] })) : shape === "photo" ? (_jsxs(_Fragment, { children: [account, _jsxs("span", { className: "od-social-media od-social-hero", children: [_jsx(Picture, { item: first, labels: labels }), media.length > 1 ? (_jsx("span", { className: "od-social-dots", "aria-hidden": "true", children: media.slice(0, 10).map((item, index) => (_jsx("span", { "data-current": index === 0 || undefined }, item.id))) })) : null] }), _jsxs("p", { className: "od-social-caption", children: [_jsx("strong", { children: shownHandle }), " ", text.trim() === "" ? null : _jsx(RichText, { text: text })] })] })) : shape === "pin" ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "od-social-media od-social-hero", children: _jsx(Picture, { item: first, labels: labels }) }), title === "" ? null : _jsx("p", { className: "od-social-title", children: title }), body, account] })) : shape === "video" && !vertical ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "od-social-media od-social-hero", children: _jsx(Picture, { item: first, labels: labels }) }), _jsx("p", { className: "od-social-title", children: title === "" ? text.split("\n")[0] : title }), account, body] })) : (_jsxs("span", { className: "od-social-media od-social-hero", children: [_jsx(Picture, { item: first, labels: labels }), _jsxs("span", { className: "od-social-overlay", children: [_jsx("strong", { children: `@${shownHandle}` }), title === "" ? null : (_jsx("span", { className: "od-social-title", children: title })), text.trim() === "" ? null : (_jsx("span", { className: "od-social-text", children: _jsx(RichText, { text: text }) }))] })] })) }));
}
//# sourceMappingURL=SocialPostPreview.js.map