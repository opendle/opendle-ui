import { type ReactNode } from "react";
import type { CalendarItemState } from "./calendarItems.js";
import { type PostDetailLabels } from "./calendarLabels.js";
import type { NetworkName } from "./networks.js";
export interface PostDetailMedia {
    readonly type: "image" | "video";
    readonly src: string;
    readonly alt?: string;
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
    readonly media?: readonly PostDetailMedia[];
    /** The channel has a button that changes its time. */
    readonly canReschedule?: boolean;
    /** Not shown: a channel that cannot change its time has no button. */
    readonly scheduleDisabledReason?: string;
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
    /**
     * Change the tags in place. The host saves them and gives the new `tags`.
     * Without it, the tags are read-only.
     */
    readonly onTagsChange?: (tags: readonly string[]) => void;
    /** Known tags that the tag input suggests. */
    readonly tagSuggestions?: readonly string[];
    readonly targets: readonly PostDetailTarget[];
    /** Send a failed network again. Without it, there is no retry button. */
    readonly onRetry?: (targetId: string) => Promise<void>;
    readonly onReschedule?: (targetId: string | null) => void;
    readonly rescheduleLabel?: string;
    /**
     * The form that changes a time. Without `scheduleTargetId`, it shows above
     * the content and changes the time of all channels.
     */
    readonly scheduleEditor?: ReactNode;
    /**
     * The channel of `scheduleEditor`. The editor then opens in a small panel
     * next to the calendar button of that channel.
     */
    readonly scheduleTargetId?: string | null;
    /** Close the panel of `scheduleEditor` after Escape or a press outside. */
    readonly onScheduleDismiss?: () => void;
    /**
     * Give a channel with its own time the time of the post again. Without it,
     * there is no reset button.
     */
    readonly onResetSchedule?: (targetId: string) => void;
    readonly resetScheduleLabel?: string;
    readonly errorMessage: (error: unknown) => string | null;
    /** Key numbers of the post, already formatted. */
    readonly metrics?: readonly PostDetailMetric[];
    /**
     * More content at the end, for example the comments of the post. Use
     * `PostDetailSection` for each part so that all parts look the same.
     */
    readonly children?: ReactNode;
    /** Actions next to the close button, for example an edit button. */
    readonly actions?: ReactNode;
    readonly labels?: PostDetailLabels;
}
export interface PostDetailSectionProps {
    readonly title: ReactNode;
    /** Controls at the end of the heading, for example a small button. */
    readonly actions?: ReactNode;
    readonly children: ReactNode;
    readonly className?: string;
}
/** One part of the post details below the content, with a small heading. */
export declare function PostDetailSection({ actions, children, className, title, }: PostDetailSectionProps): import("react").JSX.Element;
/**
 * The details of one post: media, text, time, tags, its numbers, and one row
 * per channel with its state, its link, its error and its actions. When the
 * text or the media differs between channels, a tab shows each version.
 */
export declare function PostDetailDialog({ actions, children, errorMessage, labels, media, metrics, onClose, onResetSchedule, onRetry, onReschedule, onScheduleDismiss, onTagsChange, rescheduleLabel, resetScheduleLabel, scheduleEditor, scheduleTargetId, open, tagColors, tagSuggestions, tags, targets, title, }: PostDetailDialogProps): import("react").JSX.Element;
//# sourceMappingURL=PostDetailDialog.d.ts.map