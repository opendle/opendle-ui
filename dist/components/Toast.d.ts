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
    /** Close the visible message. A message that waits shows next. */
    readonly dismissToast: () => void;
    /**
     * Give these to the `Toast`: a pointer or the focus on the toast stops the
     * time, and an error has a close button.
     */
    readonly toastProps: Pick<ToastProps, "onBlur" | "onDismiss" | "onFocus" | "onPointerEnter" | "onPointerLeave">;
}
/**
 * Hold one message: a message for `duration` milliseconds, an error for
 * `errorDuration`. A new message replaces a message, and a new error
 * replaces the message or the error. A message that comes during an error
 * waits until the error ends or the user closes it. A pointer or the focus
 * on the toast stops the time. Render it as
 * `<Toast key={toast.id} tone={toast.tone} {...toastProps}>`.
 */
export declare function useToastQueue(duration?: number, errorDuration?: number): ToastQueue;
//# sourceMappingURL=Toast.d.ts.map