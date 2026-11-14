import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "./Button.js";
import { postDetailLabels } from "./calendarLabels.js";
import { Dialog } from "./Dialog.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import { TabPanel, Tabs } from "./Tabs.js";
import { TagChip } from "./TagChip.js";
import { useAsyncAction } from "./useAsyncAction.js";
const noTags = [];
const stateOrder = [
    "published",
    "publishing",
    "scheduled",
    "failed",
    "cancelled",
];
const stateTones = {
    published: "ok",
    publishing: "neutral",
    scheduled: "neutral",
    failed: "bad",
    cancelled: "neutral",
};
function MediaTile({ media, playLabel }) {
    const [playing, setPlaying] = useState(false);
    if (media.type === "image") {
        return (_jsx("div", { className: "od-post-detail-media", children: _jsx("img", { alt: "", src: media.src }) }));
    }
    if (playing) {
        return (_jsx("div", { className: "od-post-detail-media", "data-playing": "true", children: _jsx("video", { "aria-label": playLabel, autoPlay: true, controls: true, playsInline: true, src: media.src }) }));
    }
    return (_jsxs("div", { className: "od-post-detail-media", children: [media.poster ? _jsx("img", { alt: "", src: media.poster }) : null, _jsx("button", { "aria-label": playLabel, className: "od-post-detail-play", onClick: () => {
                    setPlaying(true);
                }, title: playLabel, type: "button", children: _jsx(Icon, { name: "play" }) }), media.duration ? (_jsx("span", { className: "od-post-detail-duration", children: media.duration })) : null] }));
}
function TargetRow({ labels, onRetry, pending, target }) {
    return (_jsxs("li", { className: "od-post-detail-target", "data-state": target.state, children: [_jsx(NetworkIcon, { badge: true, network: target.network }), _jsx("span", { className: "od-post-detail-target-name", children: target.name }), target.state === "failed" ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "od-post-detail-target-note", children: target.error ?? labels.states.failed }), onRetry === null ? null : (_jsx(Button, { disabled: pending, icon: _jsx(Icon, { name: "retry", size: 15 }), onClick: () => {
                            onRetry(target.id);
                        }, size: "small", variant: "secondary", children: labels.retry }))] })) : target.url ? (_jsxs("a", { className: "od-post-detail-target-link", href: target.url, rel: "noreferrer", target: "_blank", children: [labels.open, _jsx(Icon, { name: "external-link", size: 13 })] })) : (_jsx("span", { className: "od-post-detail-target-state", children: labels.states[target.state] }))] }));
}
/**
 * The details of one post: media, text, time, tags, the state of each
 * network and a link to each published post. When the text or the time
 * differs between networks, each network has a tab.
 */
export function PostDetailDialog({ errorMessage, labels = postDetailLabels, media = null, onClose, onRetry, open, tags = noTags, targets, title, }) {
    const retry = useAsyncAction(errorMessage);
    const [selected, setSelected] = useState(null);
    const first = targets[0];
    const differs = targets.some((target) => target.text !== first?.text || target.when !== first.when);
    const shown = (differs ? targets.find((target) => target.id === selected) : undefined) ??
        first;
    const counts = stateOrder.flatMap((state) => {
        const count = targets.filter((target) => target.state === state).length;
        return count > 0 ? [{ state, count }] : [];
    });
    const close = () => {
        retry.reset();
        setSelected(null);
        onClose();
    };
    const body = (_jsxs("div", { className: "od-post-detail-main", "data-media": media !== null, children: [media === null ? null : (_jsx(MediaTile, { media: media, playLabel: labels.play }, media.src)), _jsxs("div", { className: "od-post-detail-text", children: [(shown?.text ?? "")
                        .split(/\n+/)
                        .filter((line) => line.trim() !== "")
                        .map((line, index) => (_jsx("p", { children: line }, `${String(index)}:${line}`))), tags.length === 0 ? null : (_jsx("div", { className: "od-post-detail-tags", children: tags.map((tag) => (_jsxs(TagChip, { children: ["#", tag] }, tag))) })), _jsx("p", { className: "od-post-detail-states", children: counts.map(({ count, state }) => (_jsxs("span", { className: "od-post-detail-pill", "data-tone": stateTones[state], children: [state === "published" ? _jsx(Icon, { name: "check", size: 13 }) : null, state === "failed" ? _jsx(Icon, { name: "alert", size: 13 }) : null, state === "scheduled" ? _jsx(Icon, { name: "clock", size: 13 }) : null, count, " ", labels.states[state]] }, state))) })] })] }));
    return (_jsxs(Dialog, { bodyClassName: "od-post-detail-body", className: "od-post-detail", closeLabel: labels.close, description: shown?.when, onClose: close, open: open, title: title, children: [differs && shown !== undefined ? (_jsxs(_Fragment, { children: [_jsx(Tabs, { className: "od-post-detail-tabs", idBase: "od-post-detail", items: targets.map((target) => ({
                            id: target.id,
                            label: (_jsxs(_Fragment, { children: [_jsx(NetworkIcon, { network: target.network }), target.name] })),
                        })), label: labels.variants, onChange: setSelected, value: shown.id }), _jsx(TabPanel, { id: shown.id, idBase: "od-post-detail", children: body })] })) : (body), retry.failure === null ? null : (_jsx(InlineAlert, { className: "od-post-detail-alert", tone: "error", children: retry.failure })), _jsx("ul", { "aria-label": labels.channels, className: "od-post-detail-targets", children: targets.map((target) => (_jsx(TargetRow, { labels: labels, onRetry: onRetry === undefined
                        ? null
                        : (targetId) => {
                            void retry.run(() => onRetry(targetId));
                        }, pending: retry.pending, target: target }, target.id))) })] }));
}
//# sourceMappingURL=PostDetailDialog.js.map