import { type ChartSeries } from "./chartScale.js";
export interface StackedBarChartProps {
    /** The accessible name, for example the metric. */
    readonly label: string;
    /** The `YYYY-MM-DD` days of the horizontal axis. */
    readonly days: readonly string[];
    readonly series: readonly ChartSeries[];
    readonly formatValue?: (value: number) => string;
    /** The name of the series that holds the series without a colour. */
    readonly otherLabel?: string;
    readonly totalLabel?: string;
    readonly dayLabel?: string;
    readonly locale?: string;
    readonly height?: number;
    /** Set false when one legend of the page names the series. */
    readonly legend?: boolean;
    /**
     * `bar` (default) for a value of each day, for example the likes of a day.
     * `area` for a level that continues, for example the followers: a day
     * without a value keeps the last known value.
     */
    readonly variant?: "bar" | "area";
    readonly className?: string;
}
/**
 * One value for each day, stacked by series, as bars or as a continuous area.
 * The legend gives the total of each series, a pointer or the arrow keys give
 * the values of one day, and a table has all values for assistive technology.
 * The series under the pointer is marked in the values of the day.
 */
export declare function StackedBarChart({ className, dayLabel, days, formatValue, height, label, legend, locale, otherLabel, series, totalLabel, variant, }: StackedBarChartProps): import("react").JSX.Element;
//# sourceMappingURL=StackedBarChart.d.ts.map