import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useState } from "react";
import { Button } from "./Button.js";
import { postDetailLabels } from "./calendarLabels.js";
import { classes } from "./classes.js";
import { Dialog } from "./Dialog.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { InlineAlert } from "./InlineAlert.js";
import { TabPanel, Tabs } from "./Tabs.js";
import { TagChip } from "./TagChip.js";
import { TagInput } from "./TagInput.js";
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
/** One part of the post details below the content, with a small heading. */
export function PostDetailSection({ actions, children, className, title, }) {
    const id = useId();
    return (_jsxs("section", { "aria-labelledby": id, className: classes("od-post-detail-section", className), children: [_jsxs("div", { className: "od-post-detail-section-heading", children: [_jsx("h3", { id: id, children: title }), actions] }), children] }));
}
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
function TargetRow({ labels, onRetry, onReschedule, rescheduleLabel, pending, target, when, }) {
    const failed = target.state === "failed";
    const meta = [
        labels.states[target.state],
        target.when === when ? null : target.when,
    ]
        .filter((part) => part !== null)
        .join(" · ");
    const reschedule = onReschedule !== undefined &&
        target.canReschedule === true &&
        (target.state === "scheduled" || failed);
    return (_jsxs("li", { className: "od-post-detail-target", "data-state": target.state, children: [_jsx(NetworkIcon, { badge: true, network: target.network }), _jsxs("div", { className: "od-post-detail-target-copy", children: [_jsx("span", { className: "od-post-detail-target-name", children: target.name }), _jsx("span", { className: "od-post-detail-target-meta", children: meta }), failed && target.error ? (_jsx("p", { className: "od-post-detail-target-error", children: target.error })) : null] }), _jsxs("div", { className: "od-post-detail-target-actions", children: [failed && onRetry !== null ? (_jsx(Button, { icon: _jsx(Icon, { name: "retry", size: 14 }), loading: pending, onClick: () => {
                            onRetry(target.id);
                        }, size: "small", variant: "secondary", children: labels.retry })) : null, reschedule ? (_jsx(IconButton, { className: "od-post-detail-target-schedule", icon: _jsx(Icon, { name: "calendar", size: 15 }), label: `${rescheduleLabel} · ${target.name}`, onClick: () => {
                            onReschedule(target.id);
                        } })) : null, target.url ? (_jsxs("a", { className: "od-button od-button-quiet od-post-detail-target-link", "data-size": "small", href: target.url, rel: "noreferrer", target: "_blank", children: [labels.open, _jsx(Icon, { name: "external-link", size: 13 })] })) : null] })] }));
}
function versionsOf(targets) {
    const versions = new Map();
    for (const target of targets) {
        const key = JSON.stringify([target.text, target.media ?? null]);
        const list = versions.get(key);
        if (list === undefined)
            versions.set(key, [target]);
        else
            list.push(target);
    }
    return [...versions.values()].map((list) => ({
        id: list[0]?.id ?? "",
        targets: list,
    }));
}
function VersionLabel({ version }) {
    const only = version.targets.length === 1 ? version.targets[0] : undefined;
    return (_jsxs("span", { className: "od-post-detail-version", children: [_jsx("span", { className: "od-post-detail-version-networks", children: version.targets.map((target) => (_jsx(NetworkIcon, { "aria-hidden": only === undefined ? undefined : true, network: target.network }, target.id))) }), only === undefined ? null : only.name] }));
}
/**
 * The details of one post: media, text, time, tags, its numbers, and one row
 * per channel with its state, its link, its error and its actions. When the
 * text or the media differs between channels, a tab shows each version.
 */
export function PostDetailDialog({ actions, children, errorMessage, labels = postDetailLabels, media = null, metrics = noMetrics, onClose, onRetry, onReschedule, onTagsChange, rescheduleLabel = "Change date and time", scheduleEditor, open, tagColors, tagSuggestions, tags = noTags, targets, title, }) {
    const retry = useAsyncAction(errorMessage);
    const [selected, setSelected] = useState(null);
    const versions = versionsOf(targets);
    const version = versions.find((entry) => entry.id === selected) ?? versions[0];
    const shown = version?.targets[0];
    const when = targets[0]?.when;
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
                        .map((line, index) => (_jsx("p", { children: line }, `${String(index)}:${line}`))), _jsxs("div", { className: "od-post-detail-metadata", children: [_jsx("p", { className: "od-post-detail-states", children: counts.map(({ count, state }) => (_jsxs("span", { className: "od-post-detail-pill", "data-tone": stateTones[state], children: [state === "published" ? _jsx(Icon, { name: "check", size: 13 }) : null, state === "failed" ? _jsx(Icon, { name: "alert", size: 13 }) : null, state === "scheduled" ? _jsx(Icon, { name: "clock", size: 13 }) : null, count, " ", labels.states[state]] }, state))) }), onTagsChange === undefined ? null : (_jsx(TagInput, { className: "od-post-detail-tag-input", label: labels.tags, onChange: onTagsChange, placeholder: labels.addTag, removeLabel: labels.removeTag, value: tags, ...(tagColors === undefined ? {} : { colors: tagColors }), ...(tagSuggestions === undefined
                                    ? {}
                                    : { suggestions: tagSuggestions }) })), onTagsChange !== undefined || tags.length === 0 ? null : (_jsx("div", { className: "od-post-detail-tags", children: tags.map((tag) => (_jsxs(TagChip, { color: tagColors?.[tag], children: ["#", tag] }, tag))) }))] })] })] }));
    return (_jsxs(Dialog, { bodyClassName: "od-post-detail-body", className: "od-post-detail", closeLabel: labels.close, description: onReschedule === undefined ? (when) : (_jsxs("button", { className: "od-post-detail-date", disabled: !targets.some((target) => target.canReschedule), onClick: () => {
                onReschedule(null);
            }, title: rescheduleLabel, type: "button", children: [when, _jsx(Icon, { name: "calendar", size: 14 })] })), headerActions: actions, onClose: close, open: open, title: title, children: [scheduleEditor, _jsxs("div", { className: "od-post-detail-content", children: [versions.length > 1 && version !== undefined ? (_jsxs(_Fragment, { children: [_jsx(Tabs, { className: "od-post-detail-versions", idBase: "od-post-detail", items: versions.map((entry) => ({
                                    id: entry.id,
                                    label: _jsx(VersionLabel, { version: entry }),
                                })), label: labels.variants, onChange: setSelected, value: version.id }), _jsx(TabPanel, { id: version.id, idBase: "od-post-detail", children: body })] })) : (body), metrics.length === 0 ? null : (_jsx("dl", { className: "od-post-detail-metrics", children: metrics.map((metric) => (_jsxs("div", { children: [_jsx("dt", { children: metric.label }), _jsx("dd", { children: metric.value })] }, metric.label))) }))] }), _jsxs(PostDetailSection, { title: labels.channels, children: [retry.failure === null ? null : (_jsx(InlineAlert, { className: "od-post-detail-alert", tone: "error", children: retry.failure })), _jsx("ul", { className: "od-post-detail-targets", children: targets.map((target) => (_jsx(TargetRow, { labels: labels, onRetry: onRetry === undefined
                                ? null
                                : (targetId) => {
                                    void retry.run(() => onRetry(targetId));
                                }, onReschedule: onReschedule, rescheduleLabel: rescheduleLabel, pending: retry.pending, target: target, when: when }, target.id))) })] }), children] }));
}
//# sourceMappingURL=PostDetailDialog.js.map