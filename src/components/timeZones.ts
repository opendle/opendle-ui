/** Named-zone conversion for calendar dates and datetime-local controls. */

export interface TimeZoneParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

function formatter(timeZone?: string): Intl.DateTimeFormat {
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

function partsOf(format: Intl.DateTimeFormat, date: Date): TimeZoneParts {
  const parts = new Map(
    format.formatToParts(date).map((part) => [part.type, part.value]),
  );
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
export function timeZoneParts(date: Date, timeZone?: string): TimeZoneParts {
  return partsOf(formatter(timeZone), date);
}

function padded(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

function dayKey(parts: TimeZoneParts): string {
  return `${padded(parts.year, 4)}-${padded(parts.month)}-${padded(parts.day)}`;
}

function wallKey(parts: TimeZoneParts): string {
  return `${dayKey(parts)}T${padded(parts.hour)}:${padded(parts.minute)}:${padded(parts.second)}`;
}

function wallEpoch(parts: TimeZoneParts, milliseconds = 0): number {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(parts.hour, parts.minute, parts.second, milliseconds);
  return date.getTime();
}

/** A named-zone calendar day, with no dependence on the browser zone. */
export function timeZoneDayKey(date: Date, timeZone?: string): string {
  return dayKey(timeZoneParts(date, timeZone));
}

/** The minute value of a datetime-local control in the requested zone. */
export function dateTimeInputValue(
  value: Date | string,
  timeZone?: string,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return wallKey(timeZoneParts(date, timeZone)).slice(0, 16);
}

/**
 * Convert a local control value to an ISO instant. The default rejects both
 * missing and repeated clock times. An explicit earlier/later choice follows
 * the same clock-change rule as Temporal disambiguation.
 */
export function dateTimeInputInstant(
  value: string,
  timeZone?: string,
  disambiguation: "reject" | "earlier" | "later" = "reject",
): string | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(
      value,
    );
  if (match === null) return null;
  const parts: TimeZoneParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? 0),
  };
  const milliseconds = Number((match[7] ?? "").padEnd(3, "0"));
  if (
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31 ||
    parts.hour > 23 ||
    parts.minute > 59 ||
    parts.second > 59
  )
    return null;
  const epoch = wallEpoch(parts, milliseconds);
  const utc = new Date(epoch);
  if (
    utc.getUTCFullYear() !== parts.year ||
    utc.getUTCMonth() + 1 !== parts.month ||
    utc.getUTCDate() !== parts.day
  )
    return null;
  const format = formatter(timeZone);
  const offsets = new Set(
    [-36, -12, 0, 12, 36].map((hours) => {
      const sample = new Date(epoch + hours * 3_600_000);
      return (
        wallEpoch(partsOf(format, sample)) -
        Math.floor(sample.getTime() / 1000) * 1000
      );
    }),
  );
  const candidates = [...offsets]
    .map((offset) => epoch - offset)
    .sort((a, b) => a - b);
  const matching = candidates.filter(
    (candidate) =>
      wallKey(partsOf(format, new Date(candidate))) === wallKey(parts),
  );
  if (matching.length === 1)
    return new Date(matching[0] ?? epoch).toISOString();
  if (disambiguation === "reject") return null;
  const choices = matching.length > 0 ? matching : candidates;
  const choice = disambiguation === "earlier" ? choices[0] : choices.at(-1);
  return choice === undefined ? null : new Date(choice).toISOString();
}
