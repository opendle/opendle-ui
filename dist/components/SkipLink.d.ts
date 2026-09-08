import type { AnchorHTMLAttributes } from "react";
export interface SkipLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> {
    readonly href: string;
    readonly label: string;
}
/** A focus-revealed native link to a host-owned content target. */
export declare function SkipLink({ className, label, ...props }: SkipLinkProps): import("react").JSX.Element;
//# sourceMappingURL=SkipLink.d.ts.map