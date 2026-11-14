import { type ReactNode } from "react";
export interface PageHeadingProps {
    readonly title: ReactNode;
    readonly actions?: ReactNode;
    readonly className?: string;
}
export declare function PageHeading({ actions, className, title }: PageHeadingProps): import("react").JSX.Element;
export interface SectionProps {
    readonly title: ReactNode;
    readonly actions?: ReactNode;
    readonly children: ReactNode;
    readonly className?: string;
}
/** A titled part of a page. */
export declare function Section({ actions, children, className, title }: SectionProps): import("react").JSX.Element;
export interface CardProps {
    readonly children: ReactNode;
    readonly padded?: boolean;
    readonly className?: string;
}
/** A bordered surface. */
export declare function Card({ children, className, padded }: CardProps): import("react").JSX.Element;
export interface ItemListProps {
    readonly children: ReactNode;
    /** Shown in place of the list when it has no rows. */
    readonly empty?: ReactNode;
    readonly className?: string;
}
/** A list of `ItemRow` elements with hairline separators. */
export declare function ItemList({ children, className, empty }: ItemListProps): import("react").JSX.Element;
export interface ItemRowProps {
    readonly icon?: ReactNode;
    readonly title: ReactNode;
    readonly meta?: ReactNode;
    readonly actions?: ReactNode;
}
export declare function ItemRow({ actions, icon, meta, title }: ItemRowProps): import("react").JSX.Element;
//# sourceMappingURL=Page.d.ts.map