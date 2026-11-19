export interface RelativeTimeOptions {
  /** The reference instant. The default is the current time. */
  readonly now?: Date | number;
  readonly locale?: Intl.LocalesArgument;
  readonly unitStyle?: Intl.RelativeTimeFormatStyle | undefined;
}

interface Unit {
  readonly name: Intl.RelativeTimeFormatUnit;
  readonly seconds: number;
}

const units: readonly Unit[] = [
  { name: "minute", seconds: 60 },
  { name: "hour", seconds: 3600 },
  { name: "day", seconds: 86_400 },
  { name: "week", seconds: 604_800 },
  { name: "month", seconds: 2_629_800 },
  { name: "year", seconds: 31_557_600 },
];

/** Below this count of the largest unit, the next unit shows too. */
const compoundLimit = 3;

const numberParts = new Set(["integer", "group", "decimal", "fraction"]);

interface Parts {
  readonly prefix: string;
  readonly number: string;
  readonly after: string;
}

function split(
  format: Intl.RelativeTimeFormat,
  amount: number,
  unit: Intl.RelativeTimeFormatUnit,
): Parts {
  const parts = format.formatToParts(amount, unit);
  const first = parts.findIndex((part) => numberParts.has(part.type));
  let last = first;
  while (numberParts.has(parts[last + 1]?.type ?? "")) last += 1;
  const text = (from: number, to: number) =>
    parts
      .slice(from, to)
      .map((part) => part.value)
      .join("");
  return {
    prefix: text(0, first),
    number: text(first, last + 1),
    after: text(last + 1, parts.length),
  };
}

/** The unit mark after a number, for example "d" or " days". */
function unitMark(
  format: Intl.RelativeTimeFormat,
  amount: number,
  unit: Intl.RelativeTimeFormatUnit,
): string {
  const future = split(format, amount, unit).after;
  const past = split(format, -amount, unit).after;
  let length = 0;
  while (length < future.length && future[length] === past[length]) {
    length += 1;
  }
  return future.slice(0, length).trimEnd();
}

/**
 * An instant relative to now, in one or two units: "now", "in 13m",
 * "2h 15m ago", "in 1d 12h", "5d ago", "in 1w 3d", "in 4mo", "1y 2mo ago".
 * The second unit shows only while the first is below 3.
 */
export function formatRelativeTime(
  value: Date | number | string,
  { locale, now = Date.now(), unitStyle = "long" }: RelativeTimeOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);
  const seconds = (date.getTime() - new Date(now).getTime()) / 1000;
  const sign = seconds < 0 ? -1 : 1;
  const distance = Math.abs(seconds);
  const format = new Intl.RelativeTimeFormat(locale, {
    numeric: "always",
    style: unitStyle,
  });
  if (!Number.isFinite(distance)) throw new RangeError("Invalid date");
  if (distance < 45) {
    return new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
      style: unitStyle,
    }).format(0, "second");
  }

  const index = Math.max(
    0,
    units.findLastIndex((entry) => distance >= entry.seconds),
  );
  const unit = units[index] ?? { name: "minute", seconds: 60 };
  const smaller = units[index - 1];
  const larger = units[index + 1];

  let count = Math.floor(distance / unit.seconds);
  if (smaller === undefined || count >= compoundLimit) {
    count = Math.max(1, Math.round(distance / unit.seconds));
    if (larger !== undefined && count * unit.seconds >= larger.seconds) {
      return format.format(sign, larger.name);
    }
    return format.format(sign * count, unit.name);
  }

  let rest = Math.round((distance - count * unit.seconds) / smaller.seconds);
  if (rest >= Math.round(unit.seconds / smaller.seconds)) {
    count += 1;
    rest = 0;
  }
  if (rest === 0) return format.format(sign * count, unit.name);

  const main = split(format, sign * count, unit.name);
  const mark = unitMark(format, count, unit.name);
  const second = split(format, sign * rest, smaller.name);
  const secondMark = unitMark(format, rest, smaller.name);
  return [
    main.prefix,
    main.number,
    mark,
    " ",
    second.number,
    secondMark,
    main.after.slice(mark.length),
  ].join("");
}
