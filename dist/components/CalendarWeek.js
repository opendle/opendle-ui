import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarEntry } from "./CalendarEntry.js";
import { calendarDayDate, calendarDayKey, calendarGridDays, } from "./calendarDates.js";
import { timeZoneParts } from "./timeZones.js";
import { useMinute } from "./useMinute.js";
const halfHours = Array.from({ length: 48 }, (_, index) => index);
function slotOf(item, timeZone) {
    const start = timeZoneParts(new Date(item.start), timeZone);
    return start.hour * 2 + (start.minute >= 30 ? 1 : 0);
}
/**
 * One week against a time axis of 24 hours. A row is one half hour. A row
 * grows with its entries, and a row without entries stays thin.
 */
export function CalendarWeek({ anchor, drag, formats, groups, labels, now, onSelect, today, timeZone, }) {
    const clock = useMinute();
    const present = now ?? clock;
    const days = calendarGridDays("week", anchor);
    // The half hour of the present, and the part of it that is over.
    const onToday = calendarDayKey(present, timeZone) === today;
    const nowParts = timeZoneParts(present, timeZone);
    const nowSlot = nowParts.hour * 2 + (nowParts.minute >= 30 ? 1 : 0);
    const nowPart = (nowParts.minute % 30) / 30;
    return (_jsxs("table", { className: "od-calendar-week", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "od-calendar-week-corner", scope: "col", children: _jsx("span", { className: "od-visually-hidden", children: labels.time }) }), days.map((day) => {
                            const date = calendarDayDate(day);
                            return (_jsx("th", { "aria-current": day === today ? "date" : undefined, "aria-label": formats.fullDay.format(date), "data-today": day === today, scope: "col", children: _jsxs("span", { className: "od-calendar-day-head", children: [_jsx("span", { className: "od-calendar-week-weekday", children: formats.weekday.format(date) }), _jsx("span", { className: "od-calendar-day-number", children: date.getDate() })] }) }, day));
                        })] }) }), _jsx("tbody", { children: halfHours.map((slot) => {
                    const hour = Math.floor(slot / 2);
                    const label = (formats.hour ?? formats.time).format(new Date(2000, 0, 1, hour, 0));
                    return (_jsxs("tr", { "data-half": slot % 2 === 1, children: [slot % 2 === 0 ? (_jsx("th", { className: "od-calendar-week-hour", rowSpan: 2, scope: "row", children: _jsx("time", { children: label }) })) : null, days.map((day) => {
                                const current = day === today && onToday && slot === nowSlot;
                                const entries = (groups.get(day) ?? []).filter((item) => slotOf(item, timeZone) === slot);
                                return (_jsx("td", { "data-now": current || undefined, "data-past": day < today ||
                                        (day === today && onToday && slot < nowSlot), "data-today": day === today, ...drag.target(day, formats.time, slot), style: current
                                        ? {
                                            "--od-calendar-now": `${String(Math.round(nowPart * 1000) / 10)}%`,
                                        }
                                        : undefined, children: entries.length === 0 ? null : (_jsx("div", { className: "od-calendar-week-cell", children: entries.map((item) => (_jsx(CalendarEntry, { item: item, drag: drag.entry(item), onSelect: onSelect, followUpLabels: labels.followUps, stateLabels: labels.states, time: formats.time.format(new Date(item.start)) }, item.id))) })) }, day));
                            })] }, slot));
                }) })] }));
}
//# sourceMappingURL=CalendarWeek.js.map