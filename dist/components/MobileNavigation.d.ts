import { type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
export interface MobileNavigationItem {
    readonly id: string;
    readonly label: ReactNode;
    readonly icon: ReactNode;
    readonly active?: boolean;
    readonly badge?: ReactNode;
    readonly href?: string;
}
export interface MobileNavigationDestination extends MobileNavigationItem {
    readonly href: string;
}
export interface MobileNavigationSurface {
    readonly label: string;
    readonly icon: ReactNode;
    readonly applicationName: string;
    readonly context: {
        readonly label: string;
        readonly value: string;
    };
    readonly accountActions: ReactNode;
    readonly closeLabel: string;
    readonly items: readonly MobileNavigationDestination[];
}
export interface MobileNavigationProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect"> {
    readonly items: readonly MobileNavigationItem[];
    readonly onSelect?: (id: string) => void;
    readonly onNavigate?: (item: MobileNavigationDestination, event: MouseEvent<HTMLAnchorElement>) => void;
    readonly surface?: MobileNavigationSurface;
}
/** A persistent row with optional host-owned destinations and account access. */
export declare function MobileNavigation({ className, items, onNavigate, onSelect, surface, ...props }: MobileNavigationProps): import("react").JSX.Element;
//# sourceMappingURL=MobileNavigation.d.ts.map