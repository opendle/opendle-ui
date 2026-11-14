import { type ReactNode } from "react";
export type FeedbackTone = "neutral" | "success" | "warning" | "error";
export interface InlineAlertProps {
    readonly children: ReactNode;
    readonly tone?: FeedbackTone;
    readonly className?: string;
}
/** A message next to the control or form that it describes. */
export declare function InlineAlert({ children, className, tone, }: InlineAlertProps): import("react").JSX.Element;
export interface ToastMessage {
    readonly id: number;
    readonly message: string;
    readonly tone: "success" | "error";
}
export interface ToastStackProps {
    readonly toasts: readonly ToastMessage[];
    /** The accessible name of the region. */
    readonly label: string;
}
/** Short-lived messages above all content, including an open dialog. */
export declare function ToastStack({ label, toasts }: ToastStackProps): import("react").JSX.Element;
export interface ToastQueue {
    readonly toasts: readonly ToastMessage[];
    readonly showToast: (message: string, tone?: ToastMessage["tone"]) => void;
}
/** Hold the current toast and remove it after `duration` milliseconds. */
export declare function useToastQueue(duration?: number): ToastQueue;
//# sourceMappingURL=Feedback.d.ts.map