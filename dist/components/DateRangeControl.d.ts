import { type DateRange, type DateRangePreset } from "./dateRange.js";
export interface DateRangeControlProps {
    readonly value: DateRange;
    readonly onChange: (value: DateRange) => void;
    /** The current `YYYY-MM-DD` day. A preset ends at it. */
    readonly today: string;
    readonly presets?: readonly DateRangePreset[];
    /** The accessible name of the group. */
    readonly label: string;
    readonly fromLabel: string;
    readonly toLabel: string;
    readonly className?: string;
}
/** A range of days: presets and two date inputs. */
export declare function DateRangeControl({ className, fromLabel, label, onChange, presets, today, toLabel, value, }: DateRangeControlProps): import("react").JSX.Element;
//# sourceMappingURL=DateRangeControl.d.ts.map