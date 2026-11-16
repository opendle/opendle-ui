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
const noMetrics = [];
const stateOrder = [
    "published",
    "publishing",
    "scheduled",
    "failed",
    "cancelled",
    "draft",
];
const stateTones = {
    draft: "neutral",
    published: "ok",
    publishing: "neutral",
    scheduled: "neutral",
    failed: "bad",
    cancelled: "neutral",
};
function MediaGallery({ media, playLabel, }) {
    const [index, setIndex] = useState(0);
    const shown = media[index] ?? media[0];
    if (shown === undefined)
        return null;
    return (_jsxs("div", { className: "od-post-detail-gallery", children: [_jsx(MediaTile, { media: shown, playLabel: playLabel }, shown.src), media.length < 2 ? null : (_jsxs("div", { className: "od-post-detail-gallery-controls", "aria-label": "Media", children: [_jsx(Button, { variant: "quiet", "aria-label": "Previous image", disabled: index === 0, onClick: () => {
                            setIndex((current) => Math.max(0, current - 1));
                        }, children: _jsx(Icon, { name: "chevron-left", size: 16 }) }), _jsxs("output", { children: [index + 1, " / ", media.length] }), _jsx(Button, { variant: "quiet", "aria-label": "Next image", disabled: index >= media.length - 1, onClick: () => {
                            setIndex((current) => Math.min(media.length - 1, current + 1));
                        }, children: _jsx(Icon, { name: "chevron-right", size: 16 }) })] }))] }));
}
function MediaTile({ media, playLabel }) {
    const [playing, setPlaying] = useState(false);
    if (media.type === "image") {
        return (_jsx("div", { className: "od-post-detail-media", children: _jsx("img", { alt: media.alt ?? "", src: media.src }) }));
    }
    if (playing) {
        return (_jsx("div", { className: "od-post-detail-media", "data-playing": "true", children: _jsx("video", { "aria-label": playLabel, autoPlay: true, controls: true, playsInline: true, src: media.src }) }));
    }
    return (_jsxs("div", { className: "od-post-detail-media", children: [media.poster ? (_jsx("img", { alt: "", src: media.poster })) : (_jsx("video", { "aria-label": playLabel, muted: true, playsInline: true, preload: "metadata", src: media.src })), _jsx("button", { "aria-label": playLabel, className: "od-post-detail-play", onClick: () => {
                    setPlaying(true);
                }, title: playLabel, type: "button", children: _jsx(Icon, { name: "play" }) }), media.duration ? (_jsx("span", { className: "od-post-detail-duration", children: media.duration })) : null] }));
}
function TargetRow({ labels, onRetry, onReschedule, rescheduleLabel, pending, target, }) {
    return (_jsxs("li", { className: "od-post-detail-target", "data-state": target.state, children: [_jsx(NetworkIcon, { badge: true, network: target.network }), _jsx("span", { className: "od-post-detail-target-name", children: target.name }), target.state === "failed" ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "od-post-detail-target-note", children: target.error ?? labels.states.failed }), onRetry === null ? null : (_jsx(Button, { icon: _jsx(Icon, { name: "retry", size: 15 }), loading: pending, onClick: () => {
                            onRetry(target.id);
                        }, size: "small", variant: "secondary", children: labels.retry }))] })) : target.url ? (_jsxs("a", { className: "od-post-detail-target-link", href: target.url, rel: "noreferrer", target: "_blank", children: [labels.open, _jsx(Icon, { name: "external-link", size: 13 })] })) : (_jsx("span", { className: "od-post-detail-target-state", children: labels.states[target.state] })), onReschedule === undefined ||
                (target.state !== "scheduled" && target.state !== "failed") ? null : (_jsxs("button", { className: "od-post-detail-target-schedule", disabled: !target.canReschedule, title: target.scheduleDisabledReason, onClick: () => {
                    onReschedule(target.id);
                }, type: "button", children: [_jsx(Icon, { name: "calendar", size: 13 }), rescheduleLabel] }))] }));
}
/**
 * The details of one post: media, text, time, tags, the state of each
 * network and a link to each published post. When the text or the time
 * differs between networks, each network has a tab.
 */
export function PostDetailDialog({ children, errorMessage, labels = postDetailLabels, media = null, metrics = noMetrics, onClose, onRetry, onReschedule, rescheduleLabel = "Change date and time", scheduleEditor, open, tagColors, tags = noTags, targets, title, }) {
    const retry = useAsyncAction(errorMessage);
    const [selected, setSelected] = useState(null);
    const first = targets[0];
    const differs = targets.some((target) => target.text !== first?.text ||
        target.when !== first.when ||
        JSON.stringify(target.media) !== JSON.stringify(first.media));
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
    const shownMedia = shown?.media ?? (media === null ? [] : [media]);
    const body = (_jsxs("div", { className: "od-post-detail-main", "data-media": shownMedia.length > 0, children: [_jsx(MediaGallery, { media: shownMedia, playLabel: labels.play }, shown?.id ?? "media"), _jsxs("div", { className: "od-post-detail-text", children: [(shown?.text ?? "")
                        .split(/\n+/)
                        .filter((line) => line.trim() !== "")
                        .map((line, index) => (_jsx("p", { children: line }, `${String(index)}:${line}`))), _jsxs("div", { className: "od-post-detail-metadata", children: [tags.length === 0 ? null : (_jsx("div", { className: "od-post-detail-tags", children: tags.map((tag) => (_jsxs(TagChip, { color: tagColors?.[tag], children: ["#", tag] }, tag))) })), _jsx("p", { className: "od-post-detail-states", children: counts.map(({ count, state }) => (_jsxs("span", { className: "od-post-detail-pill", "data-tone": stateTones[state], children: [state === "published" ? _jsx(Icon, { name: "check", size: 13 }) : null, state === "failed" ? _jsx(Icon, { name: "alert", size: 13 }) : null, state === "scheduled" ? _jsx(Icon, { name: "clock", size: 13 }) : null, count, " ", labels.states[state]] }, state))) })] })] })] }));
    const metricCards = metrics.length === 0 ? null : (_jsx("dl", { className: "od-post-detail-metrics", children: metrics.map((metric) => (_jsxs("div", { children: [_jsx("dt", { children: metric.label }), _jsx("dd", { children: metric.value })] }, metric.label))) }));
    return (_jsxs(Dialog, { bodyClassName: "od-post-detail-body", className: "od-post-detail", closeLabel: labels.close, description: onReschedule === undefined ? (shown?.when) : (_jsxs("button", { className: "od-post-detail-date", disabled: !targets.some((target) => target.canReschedule), onClick: () => {
                onReschedule(null);
            }, title: rescheduleLabel, type: "button", children: [shown?.when, _jsx(Icon, { name: "calendar", size: 14 })] })), onClose: close, open: open, title: title, children: [scheduleEditor, differs && shown !== undefined ? (_jsxs(_Fragment, { children: [_jsx(Tabs, { className: "od-post-detail-tabs", idBase: "od-post-detail", items: targets.map((target) => ({
                            id: target.id,
                            label: (_jsxs(_Fragment, { children: [_jsx(NetworkIcon, { network: target.network }), target.name] })),
                        })), label: labels.variants, onChange: setSelected, value: shown.id }), _jsx(TabPanel, { id: shown.id, idBase: "od-post-detail", children: body })] })) : (body), metricCards, retry.failure === null ? null : (_jsx(InlineAlert, { className: "od-post-detail-alert", tone: "error", children: retry.failure })), _jsx("ul", { "aria-label": labels.channels, className: "od-post-detail-targets", children: targets.map((target) => (_jsx(TargetRow, { labels: labels, onRetry: onRetry === undefined
                        ? null
                        : (targetId) => {
                            void retry.run(() => onRetry(targetId));
                        }, onReschedule: onReschedule, rescheduleLabel: rescheduleLabel, pending: retry.pending, target: target }, target.id))) }), children === undefined || children === null ? null : (_jsx("div", { className: "od-post-detail-extra", children: children }))] }));
}
//# sourceMappingURL=PostDetailDialog.js.map