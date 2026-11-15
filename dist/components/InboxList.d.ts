import type { MouseEvent } from "react";
import type { NetworkName } from "./networks.js";
export interface InboxEntry {
    readonly id: string;
    readonly network: NetworkName;
    readonly authorName: string;
    readonly avatarUrl: string | null;
    readonly text: string;
    /** The time, already formatted. */
    readonly when: string;
    readonly createdAt: string;
    /** The post that the message is about. */
    readonly context?: string;
    readonly href: string;
}
interface InboxGroup {
    readonly id: string;
    readonly title: string;
    readonly thumbnailUrl?: string | null;
    readonly items: readonly InboxEntry[];
}
export interface InboxListProps {
    readonly items: readonly InboxEntry[];
    /** Complete groups in host order. Their items replace the flat list. */
    readonly groups?: readonly InboxGroup[];
    readonly selectedId?: string | null;
    /** Called for an unmodified click, with the event to prevent. */
    readonly onOpen?: (item: InboxEntry, event: MouseEvent<HTMLAnchorElement>) => void;
    readonly empty: string;
    /** With it, a button at the end asks for older messages. */
    readonly onLoadMore?: () => void;
    readonly moreLabel?: string;
    /** The accessible name of the list. */
    readonly label: string;
    readonly className?: string;
}
/** The messages of an inbox. Optional post cards keep related rows together. */
export declare function InboxList({ className, empty, groups, items, label, moreLabel, onLoadMore, onOpen, selectedId, }: InboxListProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=InboxList.d.ts.map