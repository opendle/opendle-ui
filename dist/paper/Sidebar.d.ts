import type { AnchorHTMLAttributes, ReactNode } from "react";
export interface SidebarLayoutProps {
    /** The product mark, shown before the product name. */
    readonly brandMark: ReactNode;
    readonly brandName: string;
    readonly brandHref?: string;
    /** `SidebarItem` elements. */
    readonly navigation: ReactNode;
    readonly navigationLabel: string;
    /** A `SidebarAccount` element. */
    readonly account?: ReactNode;
    readonly skipLabel: string;
    readonly children: ReactNode;
    readonly className?: string;
}
/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window and a bottom bar on a phone.
 */
export declare function SidebarLayout({ account, brandHref, brandMark, brandName, children, className, navigation, navigationLabel, skipLabel, }: SidebarLayoutProps): import("react").JSX.Element;
export interface SidebarItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
    readonly href: string;
    readonly icon: ReactNode;
    readonly label: string;
    readonly active?: boolean;
    /** A count badge, for example unread messages. Zero shows no badge. */
    readonly count?: number;
}
export declare function SidebarItem({ active, className, count, icon, label, ...props }: SidebarItemProps): import("react").JSX.Element;
export interface SidebarAccountProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
    readonly href: string;
    readonly avatar: ReactNode;
    readonly name: string;
    readonly active?: boolean;
}
/** The signed-in person at the end of the sidebar. */
export declare function SidebarAccount({ active, avatar, className, name, ...props }: SidebarAccountProps): import("react").JSX.Element;
//# sourceMappingURL=Sidebar.d.ts.map