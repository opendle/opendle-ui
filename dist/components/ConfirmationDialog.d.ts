import { type DialogHTMLAttributes, type ReactNode, type RefObject } from "react";
export interface ConfirmationDialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"> {
    readonly open: boolean;
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly confirmLabel: ReactNode;
    readonly cancelLabel?: ReactNode;
    /** A failure of the last attempt. It shows in the dialog body. */
    readonly error?: ReactNode;
    readonly tone?: "default" | "danger";
    /**
     * Put the first focus on the confirm button, so Enter confirms. Use it only
     * for an action that is safe to do by accident. Without it, the first focus
     * is on Cancel. With an impact statement, Enter confirms when the typed
     * text agrees.
     */
    readonly confirmOnEnter?: boolean;
    /** The user must type this text. Enter confirms when the text agrees. */
    readonly impactStatement?: string;
    /** The prompt around the statement box, for example `Type {box} to confirm.` */
    readonly impactLabel?: (statement: ReactNode) => ReactNode;
    /** The accessible name of the input. */
    readonly impactInputLabel?: string;
    readonly copyLabel?: string;
    readonly copiedLabel?: string;
    /** Shows the irreversible warning in the danger color. */
    readonly irreversible?: boolean;
    readonly irreversibleLabel?: ReactNode;
    readonly pending?: boolean;
    readonly pendingLabel?: ReactNode;
    readonly returnFocusRef?: RefObject<HTMLElement | null>;
    readonly onCancel: () => void;
    readonly onConfirm: () => void;
}
/** A modal confirmation with an optional exact impact-statement check. */
export declare function ConfirmationDialog(props: ConfirmationDialogProps): import("react").JSX.Element;
//# sourceMappingURL=ConfirmationDialog.d.ts.map