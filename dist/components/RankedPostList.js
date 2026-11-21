import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { NetworkIcon } from "./Icon.js";
import { RelativeTime } from "./RelativeTime.js";
/**
 * Posts in rank order. Each row is one button that opens the post: the rank,
 * the media, the title, the network, the channel, the publication time, and
 * the metrics in columns that align from row to row.
 */
export function RankedPostList({ activeMetric, className, empty, items, label, onOpen, }) {
    if (items.length === 0) {
        return (_jsx("div", { className: classes("od-ranked-posts", className), children: _jsx("p", { className: "od-list-empty", children: empty }) }));
    }
    const columns = Math.max(1, ...items.map((item) => item.metrics.length));
    return (_jsx("div", { className: classes("od-ranked-posts", className), children: _jsx("ol", { "aria-label": label, className: "od-ranked-post-list", style: { "--od-ranked-metrics": columns }, children: items.map((item, index) => (_jsx("li", { children: _jsxs("button", { className: "od-ranked-post", onClick: () => {
                        onOpen(item.id);
                    }, type: "button", children: [_jsx("span", { "aria-hidden": "true", className: "od-ranked-post-rank", children: index + 1 }), _jsx("span", { className: "od-ranked-post-media", "data-video": item.video === true, children: item.previewUrl === null ? (_jsx(NetworkIcon, { "aria-hidden": "true", network: item.network })) : (_jsx("img", { alt: "", loading: "lazy", src: item.previewUrl })) }), _jsxs("span", { className: "od-ranked-post-text", children: [_jsx("span", { className: "od-ranked-post-title", children: item.title }), _jsxs("span", { className: "od-ranked-post-meta", children: [_jsx(NetworkIcon, { network: item.network }), _jsx("span", { className: "od-ranked-post-channel", children: item.channel }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx(RelativeTime, { unitStyle: "narrow", value: item.at })] })] }), _jsx("span", { className: "od-ranked-post-metrics", children: item.metrics.map((metric) => (_jsxs("span", { className: "od-ranked-post-metric", "data-active": metric.id === activeMetric, children: [_jsx("b", { children: metric.value }), _jsx("span", { children: metric.label })] }, metric.id))) })] }) }, item.id))) }) }));
}
//# sourceMappingURL=RankedPostList.js.map