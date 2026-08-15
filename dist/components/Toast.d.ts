import type { HTMLAttributes, ReactNode } from "react";
export interface ToastProps extends HTMLAttributes<HTMLOutputElement> {
    readonly children: ReactNode;
    readonly onDismiss?: () => void;
}
export declare function Toast({ children, className, onDismiss, ...props }: ToastProps): import("react").JSX.Element;
//# sourceMappingURL=Toast.d.ts.map