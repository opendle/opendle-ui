import type { Ref, TextareaHTMLAttributes } from "react";
export interface AutoGrowTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    readonly maxHeight?: number;
    readonly ref?: Ref<HTMLTextAreaElement>;
}
export declare function AutoGrowTextarea({ maxHeight, onInput, rows, className, style, value, defaultValue, ref, ...props }: AutoGrowTextareaProps): import("react").JSX.Element;
//# sourceMappingURL=AutoGrowTextarea.d.ts.map