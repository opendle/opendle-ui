import { type AriaAttributes, type DetailsHTMLAttributes, type FieldsetHTMLAttributes, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
type FieldRequirement = "required" | "optional";
type FormFieldOrientation = "stacked" | "inline";
type FormSectionColumns = 1 | 2;
type FormSectionVariant = "default" | "plain";
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
    /** Secondary or destructive actions, separate from the main form action. */
    readonly secondaryActions?: ReactNode;
}
export declare function FormActions({ alignment, children, className, secondaryActions, ...props }: FormActionsProps): import("react").JSX.Element;
export interface FormGridProps extends HTMLAttributes<HTMLDivElement> {
    readonly columns?: FormSectionColumns;
    readonly children: ReactNode;
}
export type FormControlsProps = FieldsetHTMLAttributes<HTMLFieldSetElement>;
/** Groups form controls without a visible frame; disabled locks the whole group. */
export declare function FormControls({ className, ...props }: FormControlsProps): import("react").JSX.Element;
/** A responsive field grid without an extra visible container. */
export declare function FormGrid({ children, className, columns, ...props }: FormGridProps): import("react").JSX.Element;
export interface FormSectionProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "children"> {
    readonly actions?: ReactNode;
    readonly children: ReactNode;
    readonly columns?: FormSectionColumns;
    readonly description?: ReactNode;
    readonly legend: ReactNode;
    readonly variant?: FormSectionVariant;
}
export declare function FormSection({ actions, children, className, columns, description, legend, variant, ...props }: FormSectionProps): import("react").JSX.Element;
export interface AdvancedFieldsDisclosureProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "children"> {
    readonly children: ReactNode;
    readonly description?: ReactNode;
    readonly summary?: ReactNode;
}
export declare function AdvancedFieldsDisclosure({ children, className, description, summary, ...props }: AdvancedFieldsDisclosureProps): import("react").JSX.Element;
export type { FieldRequirement, FormActionsAlignment, FormFieldOrientation, FormSectionColumns, FormSectionVariant, };
//# sourceMappingURL=Form.d.ts.map