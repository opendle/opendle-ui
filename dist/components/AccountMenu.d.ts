import type { AnchorHTMLAttributes, ReactNode } from "react";
export interface AccountMenuProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "title"> {
    readonly href: string;
    /** An `Avatar` element. */
    readonly avatar: ReactNode;
    readonly name: string;
    readonly active?: boolean;
}
/** The signed-in person at the end of the application sidebar. */
export declare function AccountMenu({ active, avatar, className, name, ...props }: AccountMenuProps): import("react").JSX.Element;
//# sourceMappingURL=AccountMenu.d.ts.map