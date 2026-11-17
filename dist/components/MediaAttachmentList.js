import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { mediaAttachmentListLabels, } from "./mediaAttachmentLabels.js";
const dragType = "application/x-opendle-attachment";
function durationOf(seconds) {
    const whole = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(whole / 60);
    return `${String(minutes)}:${String(whole % 60).padStart(2, "0")}`;
}
const kindIcons = { image: "image", video: "play", file: "file" };
/**
 * The ordered files of a post: square previews that move by drag and drop or
 * with the move buttons, and a remove button on each.
 */
export function MediaAttachmentList({ actions, children, className, disabled = false, items, labels = mediaAttachmentListLabels, onMove, onOpen, onRemove, }) {
    const [dragged, setDragged] = useState(null);
    const [over, setOver] = useState(null);
    const movable = onMove !== undefined && !disabled && items.length > 1;
    const end = () => {
        setDragged(null);
        setOver(null);
    };
    const drop = (event, index) => {
        if (dragged === null || !event.dataTransfer.types.includes(dragType))
            return;
        event.preventDefault();
        if (dragged !== index)
            onMove?.(dragged, index);
        end();
    };
    return (_jsxs("ul", { "aria-label": labels.list, className: classes("od-attachments", className), children: [items.map((item, index) => {
                const uploading = item.progress !== undefined && item.progress !== null;
                return (_jsxs("li", { className: "od-attachment", "data-dragging": dragged === index || undefined, "data-drop-target": dragged !== null && over === index && dragged !== index
                        ? true
                        : undefined, "data-invalid": item.error ? true : undefined, draggable: movable && !uploading, onDragEnd: end, onDragOver: (event) => {
                        if (dragged === null)
                            return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        setOver(index);
                    }, onDragStart: (event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(dragType, item.id);
                        setDragged(index);
                    }, onDrop: (event) => {
                        drop(event, index);
                    }, title: item.error ?? undefined, children: [onOpen === undefined || uploading ? (_jsx("span", { className: "od-attachment-preview", children: _jsx(AttachmentPicture, { item: item }) })) : (_jsx("button", { "aria-label": `${labels.open}: ${item.label}`, className: "od-attachment-preview", onClick: () => {
                                onOpen(item.id);
                            }, type: "button", children: _jsx(AttachmentPicture, { item: item }) })), item.kind === "video" &&
                            item.duration !== undefined &&
                            item.duration !== null ? (_jsx("span", { className: "od-attachment-duration", children: durationOf(item.duration) })) : null, item.badge ? (_jsx("span", { className: "od-attachment-badge", children: item.badge })) : null, uploading ? (_jsx("progress", { "aria-label": `${labels.uploading}: ${item.label}`, className: "od-attachment-progress", max: 100, value: Math.round((item.progress ?? 0) * 100) })) : null, _jsxs("span", { className: "od-attachment-actions", children: [movable && !uploading ? (_jsxs(_Fragment, { children: [_jsx("button", { "aria-label": `${labels.moveEarlier}: ${item.label}`, className: "od-attachment-action", disabled: index === 0, onClick: () => {
                                                onMove(index, index - 1);
                                            }, title: labels.moveEarlier, type: "button", children: _jsx(Icon, { name: "chevron-left", size: 14 }) }), _jsx("button", { "aria-label": `${labels.moveLater}: ${item.label}`, className: "od-attachment-action", disabled: index === items.length - 1, onClick: () => {
                                                onMove(index, index + 1);
                                            }, title: labels.moveLater, type: "button", children: _jsx(Icon, { name: "chevron-right", size: 14 }) })] })) : null, uploading ? null : actions?.(item, index), _jsx("button", { "aria-label": `${labels.remove}: ${item.label}`, className: "od-attachment-action", disabled: disabled, onClick: () => {
                                        onRemove(item.id);
                                    }, title: labels.remove, type: "button", children: _jsx(Icon, { name: "close", size: 14 }) })] })] }, item.id));
            }), children === undefined || children === null ? null : (_jsx("li", { className: "od-attachment od-attachment-extra", children: children }))] }));
}
function AttachmentPicture({ item }) {
    return item.previewUrl === null ? (_jsx("span", { className: "od-attachment-placeholder", children: _jsx(Icon, { name: kindIcons[item.kind], size: 22 }) })) : (_jsx("img", { alt: "", draggable: false, src: item.previewUrl }));
}
//# sourceMappingURL=MediaAttachmentList.js.map