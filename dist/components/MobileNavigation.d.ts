import type { HTMLAttributes, ReactNode } from "react";
export interface MobileNavigationItem {
    readonly id: string;
    readonly label: ReactNode;
    readonly icon: ReactNode;
    readonly active?: boolean;
    readonly badge?: ReactNode;
}
export interface MobileNavigationProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect"> {
    readonly items: readonly MobileNavigationItem[];
    readonly onSelect: (id: string) => void;
}
export declare function MobileNavigation({ className, items, onSelect, ...props }: MobileNavigationProps): import("react").JSX.Element;
//# sourceMappingURL=MobileNavigation.d.ts.map