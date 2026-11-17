import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { NetworkIcon } from "./Icon.js";
import { tagFilterLabels, } from "./calendarLabels.js";
import { SegmentedControl } from "./SegmentedControl.js";
import { TagChip } from "./TagChip.js";
const noColors = {};
function toggled(list, item) {
    return list.includes(item)
        ? list.filter((entry) => entry !== item)
        : [...list, item];
}
/**
 * Filters for channels and tags, with the AND or OR logic of the tags. A
 * group with no entry does not show.
 */
export function TagFilterBar({ channels, className, controls, labels = tagFilterLabels, onChange, tagColors = noColors, tags, value, }) {
    const hasControls = controls !== undefined && controls !== null;
    const hasChoices = channels.length > 0 || tags.length > 0;
    if (!hasControls && !hasChoices)
        return null;
    const choices = (_jsxs(_Fragment, { children: [channels.length === 0 ? null : (_jsx("fieldset", { "aria-label": labels.channels, className: "od-tag-filter-group", children: _jsx("span", { className: "od-tag-filter-channels", "data-filtered": value.channels.length > 0, children: channels.map((channel) => (_jsx("button", { "aria-label": channel.label, "aria-pressed": value.channels.includes(channel.id), className: "od-tag-filter-channel", onClick: () => {
                            onChange({
                                ...value,
                                channels: toggled(value.channels, channel.id),
                            });
                        }, title: channel.label, type: "button", children: _jsx(NetworkIcon, { badge: true, network: channel.network }) }, channel.id))) }) })), tags.length === 0 ? null : (_jsx("fieldset", { "aria-label": labels.tags, className: "od-tag-filter-group", children: tags.map((tag) => (_jsxs(TagChip, { color: tagColors[tag], onPressedChange: () => {
                        onChange({ ...value, tags: toggled(value.tags, tag) });
                    }, pressed: value.tags.includes(tag), children: ["#", tag] }, tag))) })), tags.length === 0 ? null : (_jsx(SegmentedControl, { className: "od-tag-filter-match", label: labels.match, onChange: (match) => {
                    onChange({ ...value, match });
                }, options: [
                    { value: "all", label: labels.matchAll },
                    { value: "any", label: labels.matchAny },
                ], size: "small", value: value.match }))] }));
    if (!hasControls) {
        return (_jsx("fieldset", { "aria-label": labels.filters, className: classes("od-tag-filter", className), children: choices }));
    }
    return (_jsxs("fieldset", { "aria-label": labels.filters, className: classes("od-tag-filter", className), "data-controls": "true", children: [_jsx("div", { className: "od-tag-filter-controls", children: controls }), hasChoices ? (_jsx("div", { className: "od-tag-filter-choices", children: choices })) : null] }));
}
//# sourceMappingURL=TagFilterBar.js.map