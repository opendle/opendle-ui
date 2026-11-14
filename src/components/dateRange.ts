export interface DateRange {
  /** The first `YYYY-MM-DD` day. */
  readonly from: string;
  /** The last `YYYY-MM-DD` day. */
  readonly to: string;
}

export interface DateRangePreset {
  readonly days: number;
  readonly label: string;
}

function shift(day: string, days: number): string {
  const [year = 1970, month = 1, date = 1] = day.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, date + days));
  return result.toISOString().slice(0, 10);
}

/** The range of a number of days that ends at `today`. */
export function lastDays(today: string, days: number): DateRange {
  return { from: shift(today, 1 - days), to: today };
}
