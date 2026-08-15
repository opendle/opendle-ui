import type { TextareaHTMLAttributes } from "react";
export interface AutoGrowTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    readonly maxHeight?: number;
}
export declare function AutoGrowTextarea({ maxHeight, onInput, rows, style, value, defaultValue, ...props }: AutoGrowTextareaProps): import("react").JSX.Element;
//# sourceMappingURL=AutoGrowTextarea.d.ts.map