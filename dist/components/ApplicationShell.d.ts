import type { HTMLAttributes, ReactNode } from "react";
export interface ApplicationShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The product mark, shown before the product name. */
    readonly brandMark: ReactNode;
    readonly brandName: string;
    readonly brandHref?: string;
    /** `NavigationLink` or `NavigationItem` elements. */
    readonly navigation: ReactNode;
    readonly navigationLabel: string;
    /** An `AccountMenu` element at the end of the sidebar. */
    readonly account?: ReactNode;
    readonly skipLabel: string;
    readonly children: ReactNode;
    readonly mainProps?: HTMLAttributes<HTMLElement>;
}
/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window and a bottom bar on a phone.
 */
export declare function ApplicationShell({ account, brandHref, brandMark, brandName, children, className, mainProps, navigation, navigationLabel, skipLabel, ...props }: ApplicationShellProps): import("react").JSX.Element;
//# sourceMappingURL=ApplicationShell.d.ts.map