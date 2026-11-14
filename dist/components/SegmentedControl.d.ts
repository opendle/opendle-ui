import type { ReactNode } from "react";
export interface SegmentedOption<Value extends string> {
    readonly value: Value;
    readonly label: ReactNode;
}
export interface SegmentedControlProps<Value extends string> {
    /** The accessible name of the group. */
    readonly label: string;
    readonly options: readonly SegmentedOption<Value>[];
    readonly value: Value;
    readonly onChange: (value: Value) => void;
    readonly size?: "default" | "small";
    readonly className?: string;
}
/** A small set of exclusive choices that shows all of them. */
export declare function SegmentedControl<Value extends string>({ className, label, onChange, options, size, value, }: SegmentedControlProps<Value>): import("react").JSX.Element;
//# sourceMappingURL=SegmentedControl.d.ts.map