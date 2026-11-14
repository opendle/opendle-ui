function shift(day, days) {
    const [year = 1970, month = 1, date = 1] = day.split("-").map(Number);
    const result = new Date(Date.UTC(year, month - 1, date + days));
    return result.toISOString().slice(0, 10);
}
/** The range of a number of days that ends at `today`. */
export function lastDays(today, days) {
    return { from: shift(today, 1 - days), to: today };
}
//# sourceMappingURL=dateRange.js.map