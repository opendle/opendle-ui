import { type ReactNode } from "react";
export interface FormDialogProps {
    readonly open: boolean;
    readonly title: ReactNode;
    readonly description?: ReactNode;
    /** The fields of the form. Give the first one `data-dialog-initial-focus`. */
    readonly children: ReactNode;
    readonly submitLabel: ReactNode;
    readonly cancelLabel?: ReactNode;
    readonly submitDisabled?: boolean;
    readonly className?: string;
    /** The dialog closes when the work succeeds. */
    readonly onSubmit: () => Promise<void>;
    readonly onClose: () => void;
    /** The message of a failure. It shows in the dialog. */
    readonly errorMessage: (error: unknown) => string | null;
}
/**
 * A narrow modal with one small form: the fields, a failure message, Cancel
 * and a submit button with a pending state.
 */
export declare function FormDialog({ cancelLabel, children, className, description, errorMessage, onClose, onSubmit, open, submitDisabled, submitLabel, title, }: FormDialogProps): import("react").JSX.Element;
//# sourceMappingURL=FormDialog.d.ts.map