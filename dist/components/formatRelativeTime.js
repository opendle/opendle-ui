const dayLength = 86_400_000;
/** The number of the calendar day of an instant in a time zone. */
function dayNumber(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "numeric",
        timeZone,
        year: "numeric",
    }).formatToParts(date);
    const part = (type) => Number(parts.find((entry) => entry.type === type)?.value);
    return Date.UTC(part("year"), part("month") - 1, part("day")) / dayLength;
}
/**
 * An instant relative to now, with a precision that decreases with the
 * distance: "now", "in 5 minutes", "3 hours ago", "tomorrow", "in 4 days",
 * "2 weeks ago", "in 3 months", "2 years ago".
 */
export function formatRelativeTime(value, { locale, now = Date.now(), timeZone, unitStyle = "long", } = {}) {
    const date = value instanceof Date ? value : new Date(value);
    const reference = new Date(now);
    const seconds = (date.getTime() - reference.getTime()) / 1000;
    const format = (amount, unit, numeric = "always") => new Intl.RelativeTimeFormat(locale, { numeric, style: unitStyle }).format(amount, unit);
    if (Math.abs(seconds) < 45)
        return format(0, "second", "auto");
    const minutes = Math.round(seconds / 60);
    if (Math.abs(minutes) < 60)
        return format(minutes, "minute");
    const hours = Math.round(seconds / 3600);
    if (Math.abs(hours) < 24)
        return format(hours, "hour");
    const days = dayNumber(date, timeZone) - dayNumber(reference, timeZone);
    if (Math.abs(days) < 7)
        return format(days, "day", "auto");
    if (Math.abs(days) < 30)
        return format(Math.round(days / 7), "week");
    const months = Math.round(days / 30.4375);
    if (Math.abs(months) < 12)
        return format(months, "month");
    return format(Math.round(days / 365.25), "year");
}
//# sourceMappingURL=formatRelativeTime.js.map