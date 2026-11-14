import type { AnchorHTMLAttributes, ReactNode } from "react";
export interface NavigationLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "title"> {
    readonly icon: ReactNode;
    readonly label: string;
    readonly active?: boolean;
    /** A count badge, for example unread messages. Zero shows no badge. */
    readonly count?: number;
}
/** One destination of the application sidebar, as a link. */
export declare function NavigationLink({ active, className, count, icon, label, ...props }: NavigationLinkProps): import("react").JSX.Element;
//# sourceMappingURL=NavigationLink.d.ts.map