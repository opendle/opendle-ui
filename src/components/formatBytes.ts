const units = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
const step = 1000;
const oneDecimal = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

/**
 * A byte count in decimal units for people, for example `1.5 GB`. The text
 * uses the largest unit that keeps a value of 1 or more, and one decimal
 * place at most.
 */
export function formatBytes(bytes: number): string {
  let value = Math.max(0, bytes);
  let unit = 0;
  // Round first, so 999 999 bytes give `1 MB` and not `1000 KB`.
  while (unit < units.length - 1 && Math.round(value * 10) / 10 >= step) {
    value /= step;
    unit += 1;
  }
  const amount =
    unit === 0 ? String(Math.round(value)) : oneDecimal.format(value);
  return `${amount} ${units[unit] ?? "B"}`;
}
