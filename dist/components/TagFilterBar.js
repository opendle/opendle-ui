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
 * Filters for channels, channel tags and post tags, with the AND or OR logic
 * of the tags. A group with no entry does not show.
 */
export function TagFilterBar({ channelTagColors = noColors, channelTags, channels, className, labels = tagFilterLabels, onChange, postTagColors = noColors, postTags, value, }) {
    if (channels.length === 0 &&
        channelTags.length === 0 &&
        postTags.length === 0) {
        return null;
    }
    return (_jsxs("fieldset", { "aria-label": labels.filters, className: classes("od-tag-filter", className), children: [channels.length === 0 ? null : (_jsxs("fieldset", { "aria-label": labels.channels, className: "od-tag-filter-group", children: [_jsx("span", { "aria-hidden": "true", className: "od-tag-filter-label", children: labels.channels }), _jsx("span", { className: "od-tag-filter-channels", "data-filtered": value.channels.length > 0, children: channels.map((channel) => (_jsx("button", { "aria-label": channel.label, "aria-pressed": value.channels.includes(channel.id), className: "od-tag-filter-channel", onClick: () => {
                                onChange({
                                    ...value,
                                    channels: toggled(value.channels, channel.id),
                                });
                            }, title: channel.label, type: "button", children: _jsx(NetworkIcon, { badge: true, network: channel.network }) }, channel.id))) })] })), channelTags.length === 0 ? null : (_jsxs("fieldset", { "aria-label": labels.channelTags, className: "od-tag-filter-group", children: [_jsx("span", { "aria-hidden": "true", className: "od-tag-filter-label", children: labels.channelTags }), channelTags.map((tag) => (_jsxs(TagChip, { color: channelTagColors[tag], onPressedChange: () => {
                            onChange({
                                ...value,
                                channelTags: toggled(value.channelTags, tag),
                            });
                        }, pressed: value.channelTags.includes(tag), children: ["#", tag] }, tag)))] })), postTags.length === 0 ? null : (_jsxs("fieldset", { "aria-label": labels.postTags, className: "od-tag-filter-group", children: [_jsx("span", { "aria-hidden": "true", className: "od-tag-filter-label", children: labels.postTags }), postTags.map((tag) => (_jsxs(TagChip, { color: postTagColors[tag], onPressedChange: () => {
                            onChange({ ...value, postTags: toggled(value.postTags, tag) });
                        }, pressed: value.postTags.includes(tag), children: ["#", tag] }, tag)))] })), channelTags.length + postTags.length === 0 ? null : (_jsx(SegmentedControl, { className: "od-tag-filter-match", label: labels.match, onChange: (match) => {
                    onChange({ ...value, match });
                }, options: [
                    { value: "all", label: labels.matchAll },
                    { value: "any", label: labels.matchAny },
                ], size: "small", value: value.match }))] }));
}
//# sourceMappingURL=TagFilterBar.js.map