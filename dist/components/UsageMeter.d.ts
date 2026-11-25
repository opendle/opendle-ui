import type { ReactNode } from "react";
export interface UsageMeterItem {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    /** The colour slot, from 0, as in the charts. */
    readonly slot: number;
    /** A second value in the legend, for example a count of files. */
    readonly detail?: ReactNode;
}
export interface UsageMeterLabels {
    /** The text before the limit: "of" gives "2 GB of 10 GB". */
    readonly of: string;
    /** The text of the free amount, for example "8 GB free". */
    readonly free: (amount: string) => string;
    /** The text when the use reaches the limit. */
    readonly full: string;
}
export interface UsageMeterProps {
    /** The accessible name of the meter, for example "Storage". */
    readonly label: string;
    /** The parts of the use. The items without a value stay in the legend. */
    readonly items: readonly UsageMeterItem[];
    /** The maximum. Without a limit, the bar shows the parts of the use only. */
    readonly limit?: number | null;
    readonly formatValue?: (value: number) => string;
    readonly labels?: Partial<UsageMeterLabels>;
    /** Show the legend with the value of each item. The default is `true`. */
    readonly legend?: boolean;
    readonly className?: string;
}
/**
 * The use of a resource with a limit, for example the storage of an
 * account: the total, the limit and the free amount, one bar with a part for
 * each item, and a legend with the value of each item. From 80 % of the
 * limit the meter shows a warning; at the limit it shows that it is full.
 */
export declare function UsageMeter({ className, formatValue, items, label, labels, legend, limit, }: UsageMeterProps): import("react").JSX.Element;
//# sourceMappingURL=UsageMeter.d.ts.map