import type { AnchorHTMLAttributes, ReactNode } from "react";
export interface SidebarAccountProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
    readonly href: string;
    readonly avatar: ReactNode;
    readonly name: string;
    readonly active?: boolean;
}
/** The signed-in person at the end of the sidebar. */
export declare function SidebarAccount({ active, avatar, className, name, ...props }: SidebarAccountProps): import("react").JSX.Element;
//# sourceMappingURL=SidebarAccount.d.ts.map