import type { AnchorHTMLAttributes, ReactNode } from "react";
export interface NavigationLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "title"> {
    readonly icon: ReactNode;
    readonly label: ReactNode;
    readonly active?: boolean;
    readonly count?: ReactNode;
}
export declare function NavigationLink({ active, className, count, icon, label, ...props }: NavigationLinkProps): import("react").JSX.Element;
//# sourceMappingURL=NavigationLink.d.ts.map