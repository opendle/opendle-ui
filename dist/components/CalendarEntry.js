import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { calendarBoardLabels, calendarItemState, urgentState, } from "./calendarItems.js";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
/** One mark per kind of follow-up, with its count and its most urgent state. */
function followUpMarks(item) {
    // A cancelled comment or like does not count.
    const states = {
        comment: [],
        like: [],
    };
    for (const followUp of item.followUps ?? []) {
        if (followUp.state !== "cancelled")
            states[followUp.kind].push(followUp.state);
    }
    return ["comment", "like"].flatMap((kind) => states[kind].length === 0
        ? []
        : [
            {
                kind,
                count: states[kind].length,
                state: urgentState(states[kind]),
            },
        ]);
}
const stateIcons = {
    draft: "edit",
    scheduled: "clock",
    publishing: "retry",
    published: "check",
    failed: "alert",
    cancelled: "close",
};
/** One entry of a calendar or of a list of posts, with its network badges. */
export function CalendarEntry({ className, date, drag, item, followUpLabels = calendarBoardLabels.followUps, layout = "card", onSelect, stateLabels = calendarBoardLabels.states, time, }) {
    const dragged = useRef(false);
    const state = calendarItemState(item);
    const marks = followUpMarks(item);
    const style = item.color === undefined
        ? undefined
        : { "--od-calendar-item-color": item.color };
    return (_jsxs("button", { "aria-label": [
            date,
            time,
            item.title,
            stateLabels[state],
            ...marks.map((mark) => `${followUpLabels[mark.kind]}: ${stateLabels[mark.state]}`),
        ]
            .filter(Boolean)
            .join(", "), className: classes("od-calendar-item", className), "data-layout": layout, "data-state": state, draggable: drag === undefined ? undefined : true, onDragStart: (event) => {
            if (drag === undefined)
                return;
            dragged.current = true;
            drag.onStart(event);
        }, onDragEnd: () => {
            drag?.onEnd();
            window.setTimeout(() => {
                dragged.current = false;
            }, 0);
        }, onClick: () => {
            if (!dragged.current)
                onSelect(item);
        }, style: style, type: "button", children: [_jsx("span", { className: "od-calendar-item-bar" }), _jsxs("span", { className: "od-calendar-item-main", children: [_jsxs("span", { className: "od-calendar-item-top", children: [_jsx("span", { className: "od-calendar-item-state", title: stateLabels[state], children: _jsx(Icon, { name: stateIcons[state], size: 13 }) }), _jsx("time", { dateTime: item.start, children: date === undefined ? time : `${date}, ${time}` }), _jsx("span", { className: "od-calendar-item-networks", children: item.targets.map((target) => (_jsx(NetworkIcon, { badge: true, className: "od-calendar-item-network", "data-state": target.state, network: target.network }, target.id))) }), marks.map((mark) => (_jsxs("span", { className: "od-calendar-item-follow-up", "data-state": mark.state, title: `${followUpLabels[mark.kind]}: ${stateLabels[mark.state]}`, children: [_jsx(Icon, { name: mark.kind === "comment" ? "message" : "heart", size: 12 }), mark.count > 1 ? mark.count : null] }, mark.kind)))] }), _jsxs("span", { className: "od-calendar-item-title", children: [item.title, item.summary ? (_jsx("span", { className: "od-calendar-item-summary", children: item.summary })) : null] })] }), item.preview ? (_jsx("span", { className: "od-calendar-item-preview", "data-video": item.preview.video === true, children: _jsx("img", { alt: "", loading: "lazy", src: item.preview.src }) })) : null] }));
}
//# sourceMappingURL=CalendarEntry.js.map