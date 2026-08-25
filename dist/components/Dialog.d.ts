import { type DialogHTMLAttributes, type ReactNode, type RefObject } from "react";
export type DialogSize = "narrow" | "default" | "wide";
export interface DialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"> {
    readonly open: boolean;
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly eyebrow?: ReactNode;
    readonly children: ReactNode;
    readonly actions?: ReactNode;
    readonly headingLevel?: "h2" | "h3";
    readonly size?: DialogSize;
    readonly closeLabel?: string;
    readonly closeDisabled?: boolean;
    readonly showCloseButton?: boolean;
    readonly initialFocusRef?: RefObject<HTMLElement | null>;
    readonly returnFocusRef?: RefObject<HTMLElement | null>;
    readonly headerClassName?: string;
    readonly bodyClassName?: string;
    readonly actionsClassName?: string;
    readonly onClose: () => void;
}
/** A controlled native modal with fixed framing and local body scrolling. */
export declare function Dialog({ actions, actionsClassName, "aria-describedby": suppliedDescribedBy, "aria-label": ariaLabel, "aria-labelledby": suppliedLabelledBy, bodyClassName, children, className, closeDisabled, closeLabel, description, eyebrow, headerClassName, headingLevel, initialFocusRef, onClose, open, returnFocusRef, showCloseButton, size, title, ...props }: DialogProps): import("react").JSX.Element;
//# sourceMappingURL=Dialog.d.ts.map