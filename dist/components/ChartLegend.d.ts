import type { ReactNode } from "react";
export interface ChartLegendItem {
    readonly id: string;
    readonly label: string;
    /** The colour slot of the series in the charts. */
    readonly slot: number;
    /** A mark before the name, for example a network icon. */
    readonly icon?: ReactNode;
}
export interface ChartLegendProps {
    /** The accessible name of the list. */
    readonly label: string;
    readonly items: readonly ChartLegendItem[];
    readonly className?: string;
}
/** One legend for several charts that show the same series. */
export declare function ChartLegend({ className, items, label }: ChartLegendProps): import("react").JSX.Element;
//# sourceMappingURL=ChartLegend.d.ts.map