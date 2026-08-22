import { type HTMLAttributes, type ReactElement, type ReactNode } from "react";
export interface ApplicationShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    readonly children: ReactNode;
    readonly sidebar: ReactNode;
    readonly topbar?: ReactNode;
    readonly mobileNavigation: ReactElement;
    readonly mainProps?: HTMLAttributes<HTMLElement>;
}
/** A responsive application frame with caller-owned content and controls. */
export declare function ApplicationShell({ children, className, mainProps, mobileNavigation, sidebar, topbar, ...props }: ApplicationShellProps): import("react").JSX.Element;
export interface ApplicationSidebarProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    readonly brand: ReactNode;
    readonly context?: ReactNode;
    readonly navigation: ReactNode;
    readonly footer?: ReactNode;
}
/** A sticky sidebar with slots for host-owned brand, context, and navigation. */
export declare function ApplicationSidebar({ brand, className, context, footer, navigation, ...props }: ApplicationSidebarProps): import("react").JSX.Element;
export interface ApplicationTopbarProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
    readonly title: ReactNode;
    readonly leading?: ReactNode;
    readonly actions?: ReactNode;
}
/** A responsive application header with caller-owned title and actions. */
export declare function ApplicationTopbar({ actions, className, leading, title, ...props }: ApplicationTopbarProps): import("react").JSX.Element;
export interface ApplicationNavigationProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    readonly children: ReactNode;
}
/** A scrollable navigation boundary for grouped application destinations. */
export declare function ApplicationNavigation({ children, className, ...props }: ApplicationNavigationProps): import("react").JSX.Element;
export interface ApplicationNavigationGroupProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    readonly children: ReactNode;
    readonly label: ReactNode;
}
/** A labelled group inside the primary application navigation. */
export declare function ApplicationNavigationGroup({ children, className, label, "aria-labelledby": labelledBy, ...props }: ApplicationNavigationGroupProps): import("react").JSX.Element;
//# sourceMappingURL=ApplicationShell.d.ts.map