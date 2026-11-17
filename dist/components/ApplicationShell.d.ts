import { type HTMLAttributes, type ReactNode } from "react";
export interface ApplicationShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The product mark, shown before the product name. */
    readonly brandMark: ReactNode;
    readonly brandName: string;
    readonly brandHref?: string;
    /** `NavigationLink` or `NavigationItem` elements. */
    readonly navigation: ReactNode;
    readonly navigationLabel: string;
    /**
     * A second, longer list below the main one, for example the channels. It
     * scrolls. On a phone it opens from one button of the bottom bar.
     */
    readonly secondaryNavigation?: ReactNode;
    readonly secondaryNavigationLabel?: string;
    /**
     * Controls next to the product name, for example a notification
     * `Popover`. On a phone they show in the top bar next to the workspace.
     */
    readonly actions?: ReactNode;
    /** A workspace menu above the main navigation. */
    readonly workspace?: ReactNode;
    /** An `AccountMenu` element at the end of the sidebar. */
    readonly account?: ReactNode;
    /** Show the sidebar as an icon rail. */
    readonly collapsed?: boolean;
    /** With it, a button next to the account collapses the sidebar. */
    readonly onCollapsedChange?: (collapsed: boolean) => void;
    readonly collapseLabel?: string;
    readonly expandLabel?: string;
    readonly closeLabel?: string;
    readonly skipLabel: string;
    readonly children: ReactNode;
    readonly mainProps?: HTMLAttributes<HTMLElement>;
}
/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window, or when the user collapses it, and a bottom bar on a phone.
 */
export declare function ApplicationShell({ account, actions, brandHref, brandMark, brandName, children, className, closeLabel, collapsed, collapseLabel, expandLabel, mainProps, navigation, navigationLabel, onCollapsedChange, secondaryNavigation, secondaryNavigationLabel, skipLabel, workspace, ...props }: ApplicationShellProps): import("react").JSX.Element;
//# sourceMappingURL=ApplicationShell.d.ts.map