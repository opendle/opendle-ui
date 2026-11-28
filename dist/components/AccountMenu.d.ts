import { type ReactNode } from "react";
export interface AccountMenuItem {
    readonly id: string;
    readonly label: string;
    readonly icon?: ReactNode;
    /** A second line below the label, for example who sent an invitation. */
    readonly detail?: string;
    /** Mark the selected entry of a section of choices. */
    readonly current?: boolean;
    readonly onSelect: () => void;
}
export interface AccountMenuSection {
    readonly id: string;
    /** The accessible name of the section. */
    readonly label?: string;
    readonly items: readonly AccountMenuItem[];
}
export interface AccountMenuProps {
    /** An `Avatar` element. */
    readonly avatar: ReactNode;
    readonly name: string;
    readonly sections: readonly AccountMenuSection[];
    readonly className?: string;
    /** Use a card trigger and open the menu below it. */
    readonly appearance?: "account" | "workspace";
    readonly detail?: string;
    readonly label?: string;
    /**
     * A count badge on the trigger, for example open invitations. Zero shows
     * no badge.
     */
    readonly count?: number;
    /** The accessible text of the count, for example `2 invitations`. */
    readonly countLabel?: string;
}
/**
 * The signed-in person at the end of the application sidebar. A press opens
 * a menu with the actions of the account.
 */
export declare function AccountMenu({ avatar, appearance, className, count, countLabel, detail, label, name, sections, }: AccountMenuProps): import("react").JSX.Element;
//# sourceMappingURL=AccountMenu.d.ts.map