import type { ButtonHTMLAttributes, ReactNode } from "react";
export type AttentionTone = "amber" | "blue" | "lime" | "red" | "slate";
export interface AttentionRowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "title"> {
    readonly icon: ReactNode;
    readonly title: ReactNode;
    readonly detail?: ReactNode;
    readonly meta?: ReactNode;
    readonly tone?: AttentionTone;
    readonly action?: ReactNode;
}
export declare function AttentionRow({ action, className, detail, icon, meta, title, tone, type, ...props }: AttentionRowProps): import("react").JSX.Element;
//# sourceMappingURL=AttentionRow.d.ts.map