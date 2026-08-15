import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface NavigationItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    readonly icon: ReactNode;
    readonly label: ReactNode;
    readonly active?: boolean;
    readonly count?: ReactNode;
    readonly alert?: boolean;
}
export declare function NavigationItem({ active, alert, className, count, icon, label, type, ...props }: NavigationItemProps): import("react").JSX.Element;
//# sourceMappingURL=NavigationItem.d.ts.map