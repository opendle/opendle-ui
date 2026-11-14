import { type ReactNode } from "react";
export interface DialogProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly title: ReactNode;
    readonly children: ReactNode;
    /** Buttons in the footer. */
    readonly actions?: ReactNode;
    readonly size?: "default" | "wide";
    readonly closeLabel: string;
    /** Block Escape, the backdrop and the close button while work is pending. */
    readonly closeDisabled?: boolean;
    readonly className?: string;
}
/** A modal dialog on the native `dialog` element. */
export declare function Dialog({ actions, children, className, closeDisabled, closeLabel, onClose, open, size, title, }: DialogProps): import("react").JSX.Element;
export interface ConfirmDialogProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly title: ReactNode;
    readonly children?: ReactNode;
    readonly confirmLabel: string;
    readonly cancelLabel: string;
    readonly closeLabel: string;
    readonly tone?: "default" | "danger";
    /** The dialog stays open and shows the message when this rejects. */
    readonly onConfirm: () => Promise<void>;
    readonly errorMessage: (error: unknown) => string;
}
/** A dialog that asks before one action and shows its failure. */
export declare function ConfirmDialog({ cancelLabel, children, closeLabel, confirmLabel, errorMessage, onClose, onConfirm, open, title, tone, }: ConfirmDialogProps): import("react").JSX.Element;
//# sourceMappingURL=Dialog.d.ts.map