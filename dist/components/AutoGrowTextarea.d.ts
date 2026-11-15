import type { Ref, TextareaHTMLAttributes } from "react";
export interface AutoGrowTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** The height at which the text scrolls. `null` grows with all the text. */
    readonly maxHeight?: number | null;
    readonly ref?: Ref<HTMLTextAreaElement>;
}
export declare function AutoGrowTextarea({ maxHeight, onInput, rows, className, style, value, defaultValue, ref, ...props }: AutoGrowTextareaProps): import("react").JSX.Element;
//# sourceMappingURL=AutoGrowTextarea.d.ts.map