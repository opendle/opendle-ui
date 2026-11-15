import { calendarDayDate, calendarDayKey } from "./calendarDates.js";

/** The planned instant at a drop target. A slot is one local half hour. */
export function calendarDropTime(
  start: string,
  day: string,
  slot: number | undefined,
  now: Date,
): string | null {
  if (day < calendarDayKey(now)) return null;
  const date = calendarDayDate(day);
  const original = new Date(start);
  if (!Number.isFinite(original.getTime())) return null;
  if (slot === undefined) {
    date.setHours(
      original.getHours(),
      original.getMinutes(),
      original.getSeconds(),
      original.getMilliseconds(),
    );
  } else {
    if (!Number.isInteger(slot) || slot < 0 || slot > 47) return null;
    date.setHours(Math.floor(slot / 2), (slot % 2) * 30, 0, 0);
    const currentSlot = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);
    if (day === calendarDayKey(now) && slot < currentSlot) return null;
  }
  return new Date(Math.max(date.getTime(), now.getTime())).toISOString();
}
