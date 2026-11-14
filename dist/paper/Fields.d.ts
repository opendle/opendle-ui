import { type InputHTMLAttributes, type ReactNode } from "react";
import { type AutoGrowTextareaProps } from "../components/AutoGrowTextarea.js";
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children"> {
    readonly label: ReactNode;
    readonly error?: string | null;
}
/** A labelled one-line text input with an optional error message. */
export declare function TextField({ className, error, id, label, ...props }: TextFieldProps): import("react").JSX.Element;
export type { AutoGrowTextareaProps };
/** A textarea that grows with its content up to `maxHeight`. */
export declare function AutoGrowTextarea({ className, ...props }: AutoGrowTextareaProps): import("react").JSX.Element;
//# sourceMappingURL=Fields.d.ts.map