/** Round axis steps for a chart that starts at zero. */
export function chartTicks(max: number, count = 4): readonly number[] {
  if (!(max > 0)) return [0, 1];
  const rough = max / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10]
      .map((factor) => factor * power)
      .find((candidate) => candidate >= rough) ?? rough;
  const ticks: number[] = [];
  for (let value = 0; value < max + step; value += step) {
    ticks.push(Number(value.toPrecision(12)));
    if (value >= max) break;
  }
  return ticks;
}

export interface ChartSeries {
  readonly id: string;
  readonly label: string;
  /**
   * The colour slot, from 0. A series keeps its slot when a filter changes
   * the list. A slot of 9 or more has no colour of its own.
   */
  readonly slot: number;
  /** The total of the series, already formatted. It shows in the legend. */
  readonly total?: string;
  /** One value for each day. `null` is no value. */
  readonly values: readonly (number | null)[];
}

/** The number of colours of a chart. */
export const chartSlots = 9;

/**
 * The series with a colour, then one neutral series for all the others, so
 * no colour repeats.
 */
export function foldSeries(
  series: readonly ChartSeries[],
  otherLabel: string,
): readonly ChartSeries[] {
  const kept = series.filter((entry) => entry.slot < chartSlots);
  const rest = series.filter((entry) => entry.slot >= chartSlots);
  if (rest.length === 0) return kept;
  const length = Math.max(...rest.map((entry) => entry.values.length));
  return [
    ...kept,
    {
      id: "other",
      label: otherLabel,
      slot: chartSlots,
      values: Array.from({ length }, (_, day) => {
        const values = rest.flatMap((entry) => entry.values[day] ?? []);
        return values.length === 0
          ? null
          : values.reduce((sum, value) => sum + value, 0);
      }),
    },
  ];
}
