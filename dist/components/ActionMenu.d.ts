import { type ReactNode } from "react";
export interface ActionMenuItem {
    readonly id: string;
    readonly label: string;
    readonly icon?: ReactNode;
    /** `danger` marks an action that removes or ends something. */
    readonly tone?: "default" | "danger";
    /** Go to this address. Without it, the item calls `onSelect`. */
    readonly href?: string;
    readonly onSelect?: () => void;
}
export interface ActionMenuProps {
    /** The accessible name of the button and of the menu. */
    readonly label: string;
    readonly items: readonly ActionMenuItem[];
    /** The icon of the button. The default is three dots. */
    readonly icon?: ReactNode;
    /** Open the menu at the start or at the end of the button. */
    readonly align?: "start" | "end";
    readonly disabled?: boolean;
    readonly className?: string;
}
/**
 * A "more actions" button that opens a short menu of actions for one object.
 * The arrow keys, Home and End move in the menu. Escape closes it and returns
 * the focus to the button. A press outside or Tab closes it.
 */
export declare function ActionMenu({ align, className, disabled, icon, items, label, }: ActionMenuProps): import("react").JSX.Element;
//# sourceMappingURL=ActionMenu.d.ts.map