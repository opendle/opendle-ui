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
export interface InboxListProps {
    readonly items: readonly InboxEntry[];
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
/** The messages of an inbox, newest first. Each row is a link. */
export declare function InboxList({ className, empty, items, label, moreLabel, onLoadMore, onOpen, selectedId, }: InboxListProps): import("react").JSX.Element;
//# sourceMappingURL=InboxList.d.ts.map