import type { ReactNode } from "react";
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
//# sourceMappingURL=SidebarLayout.d.ts.map