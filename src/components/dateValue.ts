/** A valid date from a date, a timestamp or a date string, or null. */
export function parseDate(
  value: Date | number | string | null | undefined,
): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
