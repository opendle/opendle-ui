import { type DialogHTMLAttributes, type ReactNode, type RefObject } from "react";
export type DialogSize = "narrow" | "default" | "wide";
export type DialogAppearance = "default" | "form";
export interface DialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"> {
    readonly open: boolean;
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly eyebrow?: ReactNode;
    readonly children: ReactNode;
    readonly actions?: ReactNode;
    /** Context actions next to the close button, outside the scrollable body. */
    readonly headerActions?: ReactNode;
    /** A compact frame for editing forms with fixed footer actions. */
    readonly appearance?: DialogAppearance;
    readonly headingLevel?: "h2" | "h3";
    readonly size?: DialogSize;
    readonly closeLabel?: string;
    readonly closeDisabled?: boolean;
    readonly showCloseButton?: boolean;
    readonly initialFocusRef?: RefObject<HTMLElement | null>;
    /** Set false when the host takes focus after a route change. */
    readonly restoreFocusOnClose?: boolean;
    readonly returnFocusRef?: RefObject<HTMLElement | null>;
    readonly headerClassName?: string;
    readonly bodyClassName?: string;
    readonly actionsClassName?: string;
    readonly onClose: () => void;
}
/** A controlled native modal with fixed framing and local body scrolling. */
export declare function Dialog({ actions, actionsClassName, appearance, "aria-describedby": suppliedDescribedBy, "aria-label": ariaLabel, "aria-labelledby": suppliedLabelledBy, bodyClassName, children, className, closeDisabled, closeLabel, description, eyebrow, headerClassName, headerActions, headingLevel, initialFocusRef, onClose, open, returnFocusRef, restoreFocusOnClose, showCloseButton, size, title, ...props }: DialogProps): import("react").JSX.Element;
//# sourceMappingURL=Dialog.d.ts.map