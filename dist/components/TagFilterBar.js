import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
 * group with no entry does not show. Put it in a `FilterToolbar` with the
 * other filters and the search of the view.
 */
export function TagFilterBar({ channels, className, labels = tagFilterLabels, onChange, tagColors = noColors, tags, value, }) {
    if (channels.length === 0 && tags.length === 0)
        return null;
    return (_jsxs("fieldset", { "aria-label": labels.filters, className: classes("od-tag-filter", className), children: [channels.length === 0 ? null : (_jsx("fieldset", { "aria-label": labels.channels, className: "od-tag-filter-group", children: _jsx("span", { className: "od-tag-filter-channels", "data-filtered": value.channels.length > 0, children: channels.map((channel) => (_jsx("button", { "aria-label": channel.label, "aria-pressed": value.channels.includes(channel.id), className: "od-tag-filter-channel", onClick: () => {
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
}
//# sourceMappingURL=TagFilterBar.js.map