import type { AnchorHTMLAttributes, ReactNode } from "react";
export interface SidebarItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
    readonly href: string;
    readonly icon: ReactNode;
    readonly label: string;
    readonly active?: boolean;
    /** A count badge, for example unread messages. Zero shows no badge. */
    readonly count?: number;
}
export declare function SidebarItem({ active, className, count, icon, label, ...props }: SidebarItemProps): import("react").JSX.Element;
//# sourceMappingURL=SidebarItem.d.ts.map