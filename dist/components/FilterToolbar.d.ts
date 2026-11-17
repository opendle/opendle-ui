import type { ReactNode } from "react";
export interface FilterToolbarProps {
    /** The tabs of the view, for example `Tabs`, at the start of the row. */
    readonly start?: ReactNode;
    /** The filters of the view, for example `TagFilterBar`. They follow the tabs. */
    readonly children?: ReactNode;
    /** A `SearchField`, always at the end of the row, in a compact width. */
    readonly end?: ReactNode;
    readonly className?: string;
}
/**
 * The one toolbar of a list view: tabs, then filters, then search. When the
 * row has no room, the tabs stay above the content and the filters and the
 * search go on the line above them. A narrow toolbar puts each part on its
 * own line.
 */
export declare function FilterToolbar({ children, className, end, start, }: FilterToolbarProps): import("react").JSX.Element;
//# sourceMappingURL=FilterToolbar.d.ts.map