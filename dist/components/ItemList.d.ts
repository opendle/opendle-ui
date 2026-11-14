import type { ReactNode } from "react";
export interface ItemListProps {
    readonly children: ReactNode;
    /** Shown in place of the list when it has no rows. */
    readonly empty?: ReactNode;
    readonly className?: string;
}
/** A list of `ItemRow` elements with hairline separators. */
export declare function ItemList({ children, className, empty }: ItemListProps): import("react").JSX.Element;
//# sourceMappingURL=ItemList.d.ts.map