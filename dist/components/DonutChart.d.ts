import { type ReactNode } from "react";
export interface DonutChartItem {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    /**
     * The colour slot, from 0, as in `StackedBarChart`. The items with a slot
     * of 9 or more become one neutral item.
     */
    readonly slot: number;
    /** A mark before the name, for example a network icon. */
    readonly icon?: ReactNode;
}
export interface DonutChartProps {
    /** The accessible name, for example the metric. */
    readonly label: string;
    readonly items: readonly DonutChartItem[];
    readonly formatValue?: (value: number) => string;
    /** The value in the centre. The default is the total of the items. */
    readonly total?: ReactNode;
    /** A short caption under the value in the centre. */
    readonly totalLabel?: ReactNode;
    /** The name of the item that holds the items without a colour. */
    readonly otherLabel?: string;
    readonly className?: string;
}
/**
 * The share of each item in a total, as a ring with one slice for each item
 * and a legend with the values and the percentages. A pointer on a slice or
 * on a legend row, or the arrow keys on the ring, mark one item and show its
 * value in the centre. An item keeps the colour of its slot in all charts.
 */
export declare function DonutChart({ className, formatValue, items, label, otherLabel, total, totalLabel, }: DonutChartProps): import("react").JSX.Element;
//# sourceMappingURL=DonutChart.d.ts.map