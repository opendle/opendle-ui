import { type ReactNode } from "react";
export interface AccountMenuItem {
    readonly id: string;
    readonly label: string;
    readonly icon?: ReactNode;
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
}
/**
 * The signed-in person at the end of the application sidebar. A press opens
 * a menu with the actions of the account.
 */
export declare function AccountMenu({ avatar, className, name, sections, }: AccountMenuProps): import("react").JSX.Element;
//# sourceMappingURL=AccountMenu.d.ts.map