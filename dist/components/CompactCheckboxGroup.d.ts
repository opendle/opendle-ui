import type { FieldsetHTMLAttributes, ReactNode, Ref } from "react";
export interface CompactCheckboxGroupOption<Value extends string = string> {
    readonly value: Value;
    readonly label: string;
    readonly disabled?: boolean;
}
export interface CompactCheckboxGroupProps<Value extends string = string> extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "children" | "onChange" | "name"> {
    readonly label: string;
    readonly name?: string;
    readonly options: readonly CompactCheckboxGroupOption<Value>[];
    readonly value: readonly Value[];
    readonly onChange: (value: Value[]) => void;
    readonly ref?: Ref<HTMLFieldSetElement>;
    readonly summary?: (count: number) => ReactNode;
}
export declare function CompactCheckboxGroup<Value extends string = string>({ className, label, name, onChange, options, summary, value, ...props }: CompactCheckboxGroupProps<Value>): import("react").JSX.Element;
//# sourceMappingURL=CompactCheckboxGroup.d.ts.map