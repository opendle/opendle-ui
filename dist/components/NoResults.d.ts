import type { HTMLAttributes, ReactNode } from "react";
export interface NoResultsProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** The main line, for example `No results for “song”`. */
    readonly title: ReactNode;
    readonly actions?: ReactNode;
    readonly headingLevel?: "h2" | "h3";
    /**
     * `search` (the default) is a magnifier for a search or a filter. `media`
     * is an empty picture frame for a media library with no file.
     */
    readonly picture?: "search" | "media";
}
/**
 * The result of a search or a filter that matches nothing, or an empty
 * collection.
 */
export declare function NoResults({ actions, children, className, headingLevel, picture, title, ...props }: NoResultsProps): import("react").JSX.Element;
//# sourceMappingURL=NoResults.d.ts.map