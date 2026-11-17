/** Named-zone conversion for calendar dates and datetime-local controls. */
function formatter(timeZone) {
    return new Intl.DateTimeFormat("en-GB-u-ca-iso8601-nu-latn", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    });
}
function partsOf(format, date) {
    const parts = new Map(format.formatToParts(date).map((part) => [part.type, part.value]));
    return {
        year: Number(parts.get("year")),
        month: Number(parts.get("month")),
        day: Number(parts.get("day")),
        hour: Number(parts.get("hour")),
        minute: Number(parts.get("minute")),
        second: Number(parts.get("second")),
    };
}
/** Calendar fields in a named zone. Omit the zone for the browser default. */
export function timeZoneParts(date, timeZone) {
    return partsOf(formatter(timeZone), date);
}
function padded(value, width = 2) {
    return String(value).padStart(width, "0");
}
function dayKey(parts) {
    return `${padded(parts.year, 4)}-${padded(parts.month)}-${padded(parts.day)}`;
}
function wallKey(parts) {
    return `${dayKey(parts)}T${padded(parts.hour)}:${padded(parts.minute)}:${padded(parts.second)}`;
}
function wallEpoch(parts, milliseconds = 0) {
    const date = new Date(0);
    date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
    date.setUTCHours(parts.hour, parts.minute, parts.second, milliseconds);
    return date.getTime();
}
/** A named-zone calendar day, with no dependence on the browser zone. */
export function timeZoneDayKey(date, timeZone) {
    return dayKey(timeZoneParts(date, timeZone));
}
/** The minute value of a datetime-local control in the requested zone. */
export function dateTimeInputValue(value, timeZone) {
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime()))
        return "";
    return wallKey(timeZoneParts(date, timeZone)).slice(0, 16);
}
/**
 * Convert a local control value to an ISO instant. The default rejects both
 * missing and repeated clock times. An explicit earlier/later choice follows
 * the same clock-change rule as Temporal disambiguation.
 */
export function dateTimeInputInstant(value, timeZone, disambiguation = "reject") {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value);
    if (match === null)
        return null;
    const parts = {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
        hour: Number(match[4]),
        minute: Number(match[5]),
        second: Number(match[6] ?? 0),
    };
    const milliseconds = Number((match[7] ?? "").padEnd(3, "0"));
    if (parts.month < 1 ||
        parts.month > 12 ||
        parts.day < 1 ||
        parts.day > 31 ||
        parts.hour > 23 ||
        parts.minute > 59 ||
        parts.second > 59)
        return null;
    const epoch = wallEpoch(parts, milliseconds);
    const utc = new Date(epoch);
    if (utc.getUTCFullYear() !== parts.year ||
        utc.getUTCMonth() + 1 !== parts.month ||
        utc.getUTCDate() !== parts.day)
        return null;
    const format = formatter(timeZone);
    const offsets = new Set([-36, -12, 0, 12, 36].map((hours) => {
        const sample = new Date(epoch + hours * 3_600_000);
        return (wallEpoch(partsOf(format, sample)) -
            Math.floor(sample.getTime() / 1000) * 1000);
    }));
    const candidates = [...offsets]
        .map((offset) => epoch - offset)
        .sort((a, b) => a - b);
    const matching = candidates.filter((candidate) => wallKey(partsOf(format, new Date(candidate))) === wallKey(parts));
    if (matching.length === 1)
        return new Date(matching[0] ?? epoch).toISOString();
    if (disambiguation === "reject")
        return null;
    const choices = matching.length > 0 ? matching : candidates;
    const choice = disambiguation === "earlier" ? choices[0] : choices.at(-1);
    return choice === undefined ? null : new Date(choice).toISOString();
}
function offsetOf(timeZone, now) {
    const name = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "longOffset",
    })
        .formatToParts(now)
        .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
    return name === "GMT" ? "UTC" : name.replace("GMT", "UTC");
}
/**
 * The IANA time zones for a select control, UTC first, with the offset of
 * each zone now. `extra` adds zones that the runtime does not list.
 */
export function timeZoneOptions(extra = [], now = new Date()) {
    const names = [...new Set([...Intl.supportedValuesOf("timeZone"), ...extra])]
        .filter((name) => name !== "" && name !== "UTC")
        .sort();
    return ["UTC", ...names].map((value) => {
        const label = value.replaceAll("_", " ");
        const description = offsetOf(value, now);
        return {
            value,
            label,
            description,
            searchText: `${label} ${value} ${description}`,
        };
    });
}
//# sourceMappingURL=timeZones.js.map