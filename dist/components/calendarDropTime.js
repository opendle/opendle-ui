import { dateTimeInputInstant, timeZoneParts } from "./timeZones.js";
import { calendarDayDate, calendarDayKey } from "./calendarDates.js";
/** The planned instant at a drop target. A slot is one local half hour. */
export function calendarDropTime(start, day, slot, now, timeZone) {
    if (timeZone !== undefined) {
        if (day < calendarDayKey(now, timeZone))
            return null;
        const original = new Date(start);
        if (!Number.isFinite(original.getTime()))
            return null;
        const source = timeZoneParts(original, timeZone);
        const current = timeZoneParts(now, timeZone);
        if (slot !== undefined &&
            (!Number.isInteger(slot) || slot < 0 || slot > 47))
            return null;
        if (slot !== undefined &&
            day === calendarDayKey(now, timeZone) &&
            slot < current.hour * 2 + Math.floor(current.minute / 30))
            return null;
        const hour = slot === undefined ? source.hour : Math.floor(slot / 2);
        const minute = slot === undefined ? source.minute : (slot % 2) * 30;
        const second = slot === undefined ? source.second : 0;
        const millisecond = slot === undefined ? original.getMilliseconds() : 0;
        const value = `${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}.${String(millisecond).padStart(3, "0")}`;
        const instant = dateTimeInputInstant(value, timeZone);
        return instant === null
            ? null
            : new Date(Math.max(Date.parse(instant), now.getTime())).toISOString();
    }
    if (day < calendarDayKey(now))
        return null;
    const date = calendarDayDate(day);
    const original = new Date(start);
    if (!Number.isFinite(original.getTime()))
        return null;
    if (slot === undefined) {
        date.setHours(original.getHours(), original.getMinutes(), original.getSeconds(), original.getMilliseconds());
    }
    else {
        if (!Number.isInteger(slot) || slot < 0 || slot > 47)
            return null;
        date.setHours(Math.floor(slot / 2), (slot % 2) * 30, 0, 0);
        const currentSlot = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);
        if (day === calendarDayKey(now) && slot < currentSlot)
            return null;
    }
    return new Date(Math.max(date.getTime(), now.getTime())).toISOString();
}
//# sourceMappingURL=calendarDropTime.js.map