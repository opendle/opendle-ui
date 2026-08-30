import type { AriaAttributes, ChangeEventHandler, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { type FieldRequirement } from "./Form.js";
interface ControlFieldProps {
    readonly className?: string;
    readonly controlClassName?: string;
    readonly error?: ReactNode;
    readonly help?: ReactNode;
    readonly label: ReactNode;
    readonly requirement?: FieldRequirement;
}
interface ControlledInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "className" | "defaultChecked" | "defaultValue" | "type"> {
    readonly "aria-invalid"?: AriaAttributes["aria-invalid"];
}
export interface TextControlProps extends ControlledInputProps, ControlFieldProps {
    readonly onChange: ChangeEventHandler<HTMLInputElement>;
    readonly value: string;
}
export declare function TextControl({ className, controlClassName: controlClass, error, help, label, onChange, requirement, required, ...props }: TextControlProps): import("react").JSX.Element;
export interface NumberControlProps extends Omit<ControlledInputProps, "value">, ControlFieldProps {
    readonly onChange: ChangeEventHandler<HTMLInputElement>;
    readonly value: number | "";
}
export declare function NumberControl({ className, controlClassName: controlClass, error, help, label, requirement, required, ...props }: NumberControlProps): import("react").JSX.Element;
export interface SelectControlProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "defaultValue">, ControlFieldProps {
    readonly children: ReactNode;
    readonly onChange: ChangeEventHandler<HTMLSelectElement>;
    readonly value: string | number | readonly string[];
}
export declare function SelectControl({ children, className, controlClassName: controlClass, error, help, label, requirement, required, ...props }: SelectControlProps): import("react").JSX.Element;
export interface TextareaControlProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "defaultValue">, ControlFieldProps {
    readonly onChange: ChangeEventHandler<HTMLTextAreaElement>;
    readonly value: string;
}
export declare function TextareaControl({ className, controlClassName: controlClass, error, help, label, requirement, required, ...props }: TextareaControlProps): import("react").JSX.Element;
export interface CheckboxControlProps extends Omit<ControlledInputProps, "checked" | "value">, ControlFieldProps {
    readonly checked: boolean;
    readonly onChange: ChangeEventHandler<HTMLInputElement>;
    readonly value?: string | number | readonly string[];
}
export declare function CheckboxControl({ checked, className, controlClassName: controlClass, error, help, label, onChange, requirement, required, ...props }: CheckboxControlProps): import("react").JSX.Element;
export interface SwitchControlProps extends Omit<ControlledInputProps, "aria-checked" | "checked" | "role" | "value">, ControlFieldProps {
    readonly checked: boolean;
    readonly onChange: ChangeEventHandler<HTMLInputElement>;
    readonly value?: string | number | readonly string[];
}
export declare function SwitchControl({ checked, className, controlClassName: controlClass, error, help, label, onChange, requirement, required, ...props }: SwitchControlProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FormControls.d.ts.map