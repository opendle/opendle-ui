import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarEntry } from "./CalendarEntry.js";
import { calendarDayDate, calendarGridDays } from "./calendarDates.js";
const halfHours = Array.from({ length: 48 }, (_, index) => index);
function slotOf(item) {
    const start = new Date(item.start);
    return start.getHours() * 2 + (start.getMinutes() >= 30 ? 1 : 0);
}
/**
 * One week against a time axis of 24 hours. A row is one half hour. A row
 * grows with its entries, and a row without entries stays thin.
 */
export function CalendarWeek({ anchor, formats, groups, labels, onSelect, today, }) {
    const days = calendarGridDays("week", anchor);
    return (_jsxs("table", { className: "od-calendar-week", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "od-calendar-week-corner", scope: "col", children: _jsx("span", { className: "od-visually-hidden", children: labels.time }) }), days.map((day) => {
                            const date = calendarDayDate(day);
                            return (_jsx("th", { "aria-current": day === today ? "date" : undefined, "aria-label": formats.fullDay.format(date), "data-today": day === today, scope: "col", children: _jsxs("span", { className: "od-calendar-day-head", children: [_jsx("span", { className: "od-calendar-week-weekday", children: formats.weekday.format(date) }), _jsx("span", { className: "od-calendar-day-number", children: date.getDate() })] }) }, day));
                        })] }) }), _jsx("tbody", { children: halfHours.map((slot) => {
                    const hour = Math.floor(slot / 2);
                    const label = formats.time.format(new Date(2000, 0, 1, hour, 0));
                    return (_jsxs("tr", { "data-half": slot % 2 === 1, children: [slot % 2 === 0 ? (_jsx("th", { className: "od-calendar-week-hour", rowSpan: 2, scope: "row", children: _jsx("time", { children: label }) })) : null, days.map((day) => (_jsx("td", { "data-today": day === today, children: (groups.get(day) ?? []).map((item) => slotOf(item) === slot ? (_jsx(CalendarEntry, { item: item, onSelect: onSelect, stateLabels: labels.states, time: formats.time.format(new Date(item.start)) }, item.id)) : null) }, day)))] }, slot));
                }) })] }));
}
//# sourceMappingURL=CalendarWeek.js.map