/** Round axis steps for a chart that starts at zero. */
export declare function chartTicks(max: number, count?: number): readonly number[];
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
export declare const chartSlots = 9;
/**
 * The series with a colour, then one neutral series for all the others, so
 * no colour repeats.
 */
export declare function foldSeries(series: readonly ChartSeries[], otherLabel: string): readonly ChartSeries[];
//# sourceMappingURL=chartScale.d.ts.map