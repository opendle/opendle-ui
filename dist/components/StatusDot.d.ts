import type { HTMLAttributes } from "react";
export type StatusTone = "amber" | "blue" | "green" | "lime" | "red" | "slate";
export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
    readonly tone?: StatusTone;
}
export declare function StatusDot({ tone, className, ...props }: StatusDotProps): import("react").JSX.Element;
//# sourceMappingURL=StatusDot.d.ts.map