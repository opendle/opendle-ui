import type { HTMLAttributes, ReactNode } from "react";
export type InlineAlertTone = "info" | "success" | "warning" | "error";
export interface InlineAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    readonly actions?: ReactNode;
    readonly children: ReactNode;
    readonly title?: ReactNode;
    readonly tone?: InlineAlertTone;
}
export declare function InlineAlert({ actions, children, className, role, title, tone, ...props }: InlineAlertProps): import("react").JSX.Element;
//# sourceMappingURL=InlineAlert.d.ts.map