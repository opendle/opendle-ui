/** Round axis steps for a chart that starts at zero. */
export function chartTicks(max, count = 4) {
    if (!(max > 0))
        return [0, 1];
    const rough = max / count;
    const power = 10 ** Math.floor(Math.log10(rough));
    const step = [1, 2, 2.5, 5, 10]
        .map((factor) => factor * power)
        .find((candidate) => candidate >= rough) ?? rough;
    const ticks = [];
    for (let value = 0; value < max + step; value += step) {
        ticks.push(Number(value.toPrecision(12)));
        if (value >= max)
            break;
    }
    return ticks;
}
/** The number of colours of a chart. */
export const chartSlots = 8;
/**
 * At most eight series: the series of the last slots become one series, so
 * no colour repeats.
 */
export function foldSeries(series, otherLabel) {
    const kept = series.filter((entry) => entry.slot < chartSlots - 1);
    const rest = series.filter((entry) => entry.slot >= chartSlots - 1);
    if (rest.length <= 1) {
        return [
            ...kept,
            ...rest.map((entry) => ({ ...entry, slot: chartSlots - 1 })),
        ];
    }
    const length = Math.max(...rest.map((entry) => entry.values.length));
    return [
        ...kept,
        {
            id: "other",
            label: otherLabel,
            slot: chartSlots - 1,
            values: Array.from({ length }, (_, day) => {
                const values = rest.flatMap((entry) => entry.values[day] ?? []);
                return values.length === 0
                    ? null
                    : values.reduce((sum, value) => sum + value, 0);
            }),
        },
    ];
}
//# sourceMappingURL=chartScale.js.map