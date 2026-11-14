import type { HTMLAttributes, ReactNode } from "react";
export type ToastTone = "neutral" | "success" | "error";
export interface ToastProps extends HTMLAttributes<HTMLOutputElement> {
    readonly children: ReactNode;
    readonly onDismiss?: () => void;
    /** `success` and `error` add an icon. */
    readonly tone?: ToastTone;
}
export declare function Toast({ children, className, onDismiss, tone, ...props }: ToastProps): import("react").JSX.Element;
export interface ToastMessage {
    readonly id: number;
    readonly message: string;
    readonly tone: ToastTone;
}
export interface ToastQueue {
    /** The one visible message, or `null`. */
    readonly toast: ToastMessage | null;
    readonly showToast: (message: string, tone?: ToastTone) => void;
}
/**
 * Hold one message for `duration` milliseconds. A new message replaces the
 * old one, so only one toast shows at a time. Render it as
 * `<Toast key={toast.id}>`.
 */
export declare function useToastQueue(duration?: number): ToastQueue;
//# sourceMappingURL=Toast.d.ts.map