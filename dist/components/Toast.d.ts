import type { HTMLAttributes, ReactNode } from "react";
export type ToastTone = "neutral" | "success" | "error";
export interface ToastProps extends HTMLAttributes<HTMLOutputElement> {
    readonly children: ReactNode;
    readonly onDismiss?: () => void;
    /** `success` and `error` add an icon. */
    readonly tone?: ToastTone;
}
/** One message above all content, also above an open dialog. */
export declare function Toast({ children, className, onDismiss, tone, ...props }: ToastProps): import("react").JSX.Element;
export interface ToastMessage {
    readonly id: number;
    readonly message: string;
    readonly tone: ToastTone;
    /** The toast closes: it stays for the time of its leave animation. */
    readonly leaving?: boolean;
}
export interface ToastStackProps {
    /** The toasts, the oldest first. The newest is nearest the screen edge. */
    readonly toasts: readonly ToastMessage[];
    /** Close one toast. An error has a close button. */
    readonly onDismiss: (id: number) => void;
    /** Stop (`true`) or continue the time of the toasts. */
    readonly onPause?: (paused: boolean) => void;
    /** The accessible name of the close button. */
    readonly dismissLabel?: string;
    readonly className?: string;
}
/**
 * The toasts of a `useToastQueue`, one above the other. A pointer or the
 * focus on the stack stops the time of all its toasts.
 */
export declare function ToastStack({ className, dismissLabel, onDismiss, onPause, toasts, }: ToastStackProps): import("react").JSX.Element | null;
export interface ToastQueue {
    /** The toasts, the oldest first. Render them with `ToastStack`. */
    readonly toasts: readonly ToastMessage[];
    readonly showToast: (message: string, tone?: ToastTone) => void;
    readonly dismissToast: (id: number) => void;
    /** Stop (`true`) or continue the time of all toasts. */
    readonly pauseToasts: (paused: boolean) => void;
}
/**
 * Several toasts at a time, each with its own time: a message shows for
 * `duration` milliseconds and an error for `errorDuration`. When a toast
 * comes and `limit` toasts show, the oldest message closes, or the oldest
 * error when all are errors. The same message with the same tone does not
 * show two times: its time starts again. Render the toasts with
 * `<ToastStack toasts={toasts} onDismiss={dismissToast} onPause={pauseToasts}/>`.
 */
export declare function useToastQueue(duration?: number, errorDuration?: number, limit?: number): ToastQueue;
//# sourceMappingURL=Toast.d.ts.map