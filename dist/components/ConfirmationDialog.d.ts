import { type DialogHTMLAttributes, type ReactNode } from "react";
export interface ConfirmationDialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"> {
    readonly open: boolean;
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly confirmLabel: ReactNode;
    readonly cancelLabel?: ReactNode;
    readonly impactStatement?: string;
    readonly impactLabel?: ReactNode;
    readonly pending?: boolean;
    readonly pendingLabel?: ReactNode;
    readonly onCancel: () => void;
    readonly onConfirm: () => void;
}
/** A modal confirmation with an optional exact impact-statement check. */
export declare function ConfirmationDialog({ cancelLabel, className, confirmLabel, description, impactLabel, impactStatement, onCancel, onConfirm, open, pending, pendingLabel, title, ...props }: ConfirmationDialogProps): import("react").JSX.Element;
//# sourceMappingURL=ConfirmationDialog.d.ts.map