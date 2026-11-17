import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
const kindIcons = { image: "image", video: "play", file: "file" };
function durationOf(seconds) {
    const whole = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(whole / 60);
    return `${String(minutes)}:${String(whole % 60).padStart(2, "0")}`;
}
/**
 * A grid of square previews. Each one is a toggle button, so the user can
 * select several files with the pointer or the keyboard. A selected item shows
 * its place in the selection.
 */
export function MediaGridPicker({ className, items, label, onToggle, selected, }) {
    return (_jsxs("fieldset", { className: classes("od-media-grid-picker", className), children: [_jsx("legend", { className: "od-visually-hidden", children: label }), items.map((item) => {
                const place = selected.indexOf(item.id);
                return (_jsxs("button", { "aria-pressed": place >= 0, className: "od-media-grid-item", disabled: item.disabled, onClick: () => {
                        onToggle(item.id);
                    }, type: "button", children: [_jsxs("span", { className: "od-media-grid-picture", children: [item.previewUrl === null ? (_jsx(Icon, { name: kindIcons[item.kind], size: 24 })) : (_jsx("img", { alt: "", src: item.previewUrl })), item.kind === "video" ? (_jsxs("span", { className: "od-media-grid-kind", children: [_jsx(Icon, { name: "play", size: 12 }), item.duration === undefined || item.duration === null
                                            ? null
                                            : durationOf(item.duration)] })) : null, _jsx("span", { "aria-hidden": "true", className: "od-media-grid-mark", children: place >= 0 ? String(place + 1) : null })] }), _jsx("span", { className: "od-media-grid-label", children: item.label }), item.detail === undefined ? null : (_jsx("span", { className: "od-media-grid-detail", children: item.detail }))] }, item.id));
            })] }));
}
//# sourceMappingURL=MediaGridPicker.js.map