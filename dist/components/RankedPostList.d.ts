import type { ReactNode } from "react";
import type { NetworkName } from "./networks.js";
export interface RankedPostMetric {
    readonly id: string;
    readonly label: string;
    /** The value, already formatted. */
    readonly value: string;
}
export interface RankedPost {
    readonly id: string;
    readonly title: string;
    readonly network: NetworkName;
    /** The name of the channel that published the post. */
    readonly channel: string;
    /** The ISO instant of the publication. */
    readonly at: string;
    /** A still picture of the media, or `null` for a post without one. */
    readonly previewUrl: string | null;
    readonly video?: boolean;
    /** The same metrics, in the same order, for each post. */
    readonly metrics: readonly RankedPostMetric[];
}
export interface RankedPostListProps {
    /** The accessible name of the list. */
    readonly label: string;
    /** The posts, in rank order. */
    readonly items: readonly RankedPost[];
    /** The ID of the metric that gives the order. Each row marks its value. */
    readonly activeMetric?: string;
    readonly onOpen: (id: string) => void;
    /** The text of an empty list. */
    readonly empty: ReactNode;
    readonly className?: string;
}
/**
 * Posts in rank order. Each row is one button that opens the post: the rank,
 * the media, the title, the network, the channel, the publication time, and
 * the metrics in columns that align from row to row.
 */
export declare function RankedPostList({ activeMetric, className, empty, items, label, onOpen, }: RankedPostListProps): import("react").JSX.Element;
//# sourceMappingURL=RankedPostList.d.ts.map