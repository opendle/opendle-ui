import { type FieldsetHTMLAttributes, type ReactNode, type Ref } from "react";
export interface RadioGroupOption<Value extends string = string> {
    readonly value: Value;
    readonly label: string;
    readonly disabled?: boolean;
}
export interface RadioGroupProps<Value extends string = string> extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "children" | "onChange" | "name"> {
    readonly label: string;
    readonly name?: string;
    readonly options: readonly RadioGroupOption<Value>[];
    readonly value: Value;
    readonly onChange: (value: Value) => void;
    readonly help?: ReactNode;
    readonly error?: ReactNode;
    readonly ref?: Ref<HTMLFieldSetElement>;
}
export declare function RadioGroup<Value extends string = string>({ className, error, help, label, name, options, value, onChange, ...props }: RadioGroupProps<Value>): import("react").JSX.Element;
//# sourceMappingURL=RadioGroup.d.ts.map