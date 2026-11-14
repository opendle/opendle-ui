/** Calendar date helpers. All of them use the local time zone. */
/** A local calendar day as `YYYY-MM-DD`. */
export function calendarDayKey(date) {
    const year = String(date.getFullYear()).padStart(4, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
/** The local noon of a `YYYY-MM-DD` day. Noon is safe on clock-change days. */
export function calendarDayDate(day) {
    const [year = 1970, month = 1, date = 1] = day.split("-").map(Number);
    return new Date(year, month - 1, date, 12);
}
function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}
function weekStart(date) {
    return addDays(date, -((date.getDay() + 6) % 7));
}
/** The days that a month or week view shows, from Monday to Sunday. */
export function calendarGridDays(mode, anchor) {
    const anchorDate = calendarDayDate(anchor);
    if (mode === "week") {
        const start = weekStart(anchorDate);
        return Array.from({ length: 7 }, (_, index) => calendarDayKey(addDays(start, index)));
    }
    const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1, 12);
    const last = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0, 12);
    const start = weekStart(first);
    const weeks = Math.ceil((Math.round((last.getTime() - start.getTime()) / 86_400_000) + 1) / 7);
    return Array.from({ length: weeks * 7 }, (_, index) => calendarDayKey(addDays(start, index)));
}
/** The time range of a month or week view, for a data request. */
export function calendarPeriod(mode, anchor) {
    const days = calendarGridDays(mode, anchor);
    const first = calendarDayDate(days[0] ?? anchor);
    const last = calendarDayDate(days.at(-1) ?? anchor);
    first.setHours(0, 0, 0, 0);
    const to = addDays(last, 1);
    to.setHours(0, 0, 0, 0);
    return { from: first, to };
}
/** Move the anchor day by one month or one week. */
export function shiftCalendarAnchor(mode, anchor, steps) {
    const date = calendarDayDate(anchor);
    if (mode === "week")
        return calendarDayKey(addDays(date, steps * 7));
    return calendarDayKey(new Date(date.getFullYear(), date.getMonth() + steps, 1, 12));
}
/** The heading of a month or week view, for example "November 2026". */
export function calendarTitle(mode, anchor, locale) {
    if (mode === "month") {
        return new Intl.DateTimeFormat(locale, {
            month: "long",
            year: "numeric",
        }).format(calendarDayDate(anchor));
    }
    const days = calendarGridDays("week", anchor);
    const first = calendarDayDate(days[0] ?? anchor);
    const last = calendarDayDate(days.at(-1) ?? anchor);
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).formatRange(first, last);
}
//# sourceMappingURL=calendarDates.js.map