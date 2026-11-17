/** The largest count of columns up to `most` that keeps the rows even. */
export function balancedColumns(count: number, most: number): number {
  if (count <= 0) return 1;
  const columns = Math.max(1, Math.min(most, count));
  return Math.ceil(count / Math.ceil(count / columns));
}
