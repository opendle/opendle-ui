import { type ReactNode } from "react";
export interface PopoverProps {
    /** The accessible name of the button and of the panel. */
    readonly label: string;
    /** The icon of the button. */
    readonly icon: ReactNode;
    /** A number on the button, for example the unread items. Zero hides it. */
    readonly count?: number;
    /** The accessible text of a count, for example "3 unread". */
    readonly countLabel?: string;
    /** The panel content. It mounts when the panel opens. */
    readonly children: ReactNode;
    /** Open the panel at the start or at the end of the button. */
    readonly align?: "start" | "end";
    readonly className?: string;
    readonly panelClassName?: string;
    readonly onOpenChange?: (open: boolean) => void;
}
/**
 * An icon button that opens a non-modal panel next to it. Escape, a press
 * outside, a link in the panel or a move of the focus out of it closes the
 * panel. Escape returns the focus to the button.
 */
export declare function Popover({ align, children, className, count, countLabel, icon, label, onOpenChange, panelClassName, }: PopoverProps): import("react").JSX.Element;
//# sourceMappingURL=Popover.d.ts.map