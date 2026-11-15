import { type ReactNode } from "react";
import type { CalendarItemState } from "./calendarItems.js";
import { type PostDetailLabels } from "./calendarLabels.js";
import type { NetworkName } from "./networks.js";
export interface PostDetailMedia {
    readonly type: "image" | "video";
    readonly src: string;
    /** A still picture for a video. */
    readonly poster?: string | null;
    /** The length of a video, for example "0:38". */
    readonly duration?: string | null;
}
export interface PostDetailMetric {
    readonly label: string;
    readonly value: string;
}
/** One network that the post goes to. */
export interface PostDetailTarget {
    readonly id: string;
    readonly network: NetworkName;
    /** The name of the channel, for example the network or the account. */
    readonly name: string;
    readonly state: CalendarItemState;
    /** The address of the published post. */
    readonly url?: string | null;
    /** The reason of a failure. */
    readonly error?: string | null;
    readonly text: string;
    /** The time of this network, already formatted. */
    readonly when: string;
}
export interface PostDetailDialogProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly title: ReactNode;
    readonly media?: PostDetailMedia | null;
    /** Internal tags of the post. */
    readonly tags?: readonly string[];
    /** The colour key, from 1 to 12, of each tag name. */
    readonly tagColors?: Readonly<Record<string, number>>;
    readonly targets: readonly PostDetailTarget[];
    /** Send a failed network again. Without it, there is no retry button. */
    readonly onRetry?: (targetId: string) => Promise<void>;
    readonly errorMessage: (error: unknown) => string | null;
    /** Key numbers of the post, already formatted. */
    readonly metrics?: readonly PostDetailMetric[];
    /** More content at the end, for example the comments of the post. */
    readonly children?: ReactNode;
    readonly labels?: PostDetailLabels;
}
/**
 * The details of one post: media, text, time, tags, the state of each
 * network and a link to each published post. When the text or the time
 * differs between networks, each network has a tab.
 */
export declare function PostDetailDialog({ children, errorMessage, labels, media, metrics, onClose, onRetry, open, tagColors, tags, targets, title, }: PostDetailDialogProps): import("react").JSX.Element;
//# sourceMappingURL=PostDetailDialog.d.ts.map