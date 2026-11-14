import type { HTMLAttributes, ReactNode } from "react";
export interface CardProps extends HTMLAttributes<HTMLElement> {
    readonly children?: ReactNode;
    /** Add the standard inner padding. */
    readonly padded?: boolean;
}
/** A bordered surface. */
export declare function Card({ children, className, padded, ...props }: CardProps): import("react").JSX.Element;
//# sourceMappingURL=Card.d.ts.map