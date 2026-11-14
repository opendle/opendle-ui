import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { calendarBoardLabels, calendarItemState, } from "./calendarItems.js";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
const stateIcons = {
    scheduled: "clock",
    publishing: "retry",
    published: "check",
    failed: "alert",
    cancelled: "close",
};
/** One entry of a calendar or of a list of posts, with its network badges. */
export function CalendarEntry({ className, date, item, layout = "card", onSelect, stateLabels = calendarBoardLabels.states, time, }) {
    const state = calendarItemState(item);
    const style = item.color === undefined
        ? undefined
        : { "--od-calendar-item-color": item.color };
    return (_jsxs("button", { "aria-label": [date, time, item.kind, item.title, stateLabels[state]]
            .filter(Boolean)
            .join(", "), className: classes("od-calendar-item", className), "data-layout": layout, "data-state": state, onClick: () => {
            onSelect(item);
        }, style: style, type: "button", children: [_jsx("span", { className: "od-calendar-item-bar" }), _jsxs("span", { className: "od-calendar-item-top", children: [_jsx("time", { dateTime: item.start, children: date === undefined ? time : `${date}, ${time}` }), item.kind ? (_jsx("span", { className: "od-calendar-item-kind", children: item.kind })) : null, _jsx("span", { className: "od-calendar-item-state", title: stateLabels[state], children: _jsx(Icon, { name: stateIcons[state], size: 13 }) })] }), _jsx("span", { className: "od-calendar-item-title", children: item.title }), _jsx("span", { className: "od-calendar-item-networks", children: item.targets.map((target) => (_jsx(NetworkIcon, { badge: true, className: "od-calendar-item-network", "data-state": target.state, network: target.network }, target.id))) })] }));
}
//# sourceMappingURL=CalendarEntry.js.map