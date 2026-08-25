import { type AriaAttributes, type DetailsHTMLAttributes, type FieldsetHTMLAttributes, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
type FieldRequirement = "required" | "optional";
type FormFieldOrientation = "stacked" | "inline";
type FormSectionColumns = 1 | 2;
type FormActionsAlignment = "start" | "end" | "between";
interface FormControlAccessibilityProps {
    readonly id?: string;
    readonly "aria-describedby"?: string;
    readonly "aria-invalid"?: AriaAttributes["aria-invalid"];
}
export interface FieldHelpProps extends HTMLAttributes<HTMLParagraphElement> {
    readonly children: ReactNode;
}
export declare function FieldHelp({ children, className, ...props }: FieldHelpProps): import("react").JSX.Element;
export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
    readonly children: ReactNode;
}
export declare function FieldError({ children, className, role, ...props }: FieldErrorProps): import("react").JSX.Element;
export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    readonly children: ReactElement<FormControlAccessibilityProps>;
    readonly controlId?: string;
    readonly error?: ReactNode;
    readonly help?: ReactNode;
    readonly label: ReactNode;
    readonly orientation?: FormFieldOrientation;
    readonly requirement?: FieldRequirement;
}
export declare function FormField({ children, className, controlId, error, help, label, orientation, requirement, ...props }: FormFieldProps): import("react").JSX.Element;
export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
    readonly alignment?: FormActionsAlignment;
    readonly children: ReactNode;
}
export declare function FormActions({ alignment, children, className, ...props }: FormActionsProps): import("react").JSX.Element;
export interface FormSectionProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "children"> {
    readonly actions?: ReactNode;
    readonly children: ReactNode;
    readonly columns?: FormSectionColumns;
    readonly description?: ReactNode;
    readonly legend: ReactNode;
}
export declare function FormSection({ actions, children, className, columns, description, legend, ...props }: FormSectionProps): import("react").JSX.Element;
export interface AdvancedFieldsDisclosureProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "children"> {
    readonly children: ReactNode;
    readonly description?: ReactNode;
    readonly summary?: ReactNode;
}
export declare function AdvancedFieldsDisclosure({ children, className, description, summary, ...props }: AdvancedFieldsDisclosureProps): import("react").JSX.Element;
export type { FieldRequirement, FormActionsAlignment, FormFieldOrientation, FormSectionColumns, };
//# sourceMappingURL=Form.d.ts.map