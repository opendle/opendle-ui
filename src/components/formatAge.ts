const units: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["minute", 60],
  ["hour", 3600],
  ["day", 86_400],
  ["week", 604_800],
  ["month", 2_629_800],
  ["year", 31_557_600],
];

/**
 * The age of an instant in a short form, for example "now", "5m ago" or
 * "3h ago". A future instant shows as "now".
 */
export function formatAge(
  value: Date | number | string,
  now: Date | number = Date.now(),
  locale?: Intl.LocalesArgument,
): string {
  const seconds =
    (Number(now) -
      (value instanceof Date ? value.getTime() : new Date(value).getTime())) /
    1000;
  if (!(seconds >= 60)) {
    return new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
      style: "narrow",
    }).format(0, "second");
  }
  let unit: Intl.RelativeTimeFormatUnit = "minute";
  let size = 60;
  for (const [name, length] of units) {
    if (seconds >= length) {
      unit = name;
      size = length;
    }
  }
  return new Intl.RelativeTimeFormat(locale, { style: "narrow" }).format(
    -Math.floor(seconds / size),
    unit,
  );
}
