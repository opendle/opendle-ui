import type { HTMLAttributes, ReactNode } from "react";
export interface NoResultsProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** The main line, for example `No results for “song”`. */
    readonly title: ReactNode;
    readonly actions?: ReactNode;
    readonly headingLevel?: "h2" | "h3";
}
/** The result of a search or a filter that matches nothing. */
export declare function NoResults({ actions, children, className, headingLevel, title, ...props }: NoResultsProps): import("react").JSX.Element;
//# sourceMappingURL=NoResults.d.ts.map