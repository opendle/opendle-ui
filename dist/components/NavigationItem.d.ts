import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface NavigationItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "title"> {
    readonly icon: ReactNode;
    readonly label: string;
    readonly active?: boolean;
    /** A count badge, for example unread messages. Zero shows no badge. */
    readonly count?: number;
}
/** One destination of the application sidebar, as a button. */
export declare function NavigationItem({ active, className, count, icon, label, type, ...props }: NavigationItemProps): import("react").JSX.Element;
//# sourceMappingURL=NavigationItem.d.ts.map