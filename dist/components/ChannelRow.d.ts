import type { ChannelItem, ChannelListLabels } from "./channelLabels.js";
export interface ChannelRowProps {
    readonly item: ChannelItem;
    readonly labels: ChannelListLabels;
    readonly readOnly: boolean;
    readonly tagColors: Readonly<Record<string, number>> | undefined;
    /** Known tags that the tag input suggests. */
    readonly tagSuggestions: readonly string[] | undefined;
    /** The switch IDs of all rows, in column order. */
    readonly switchIds: readonly string[];
    /**
     * How to connect the account again: an authorization address, a host flow,
     * or `null` when the user cannot connect it from here.
     */
    readonly reconnect: {
        readonly href: string;
    } | (() => void) | null;
    readonly onRename: (name: string) => Promise<void>;
    readonly onTagsChange: (tags: readonly string[]) => void;
    readonly onSwitchChange: (switchId: string, on: boolean) => void;
    /** Read a function now. Without it, the rows show no read button. */
    readonly onSwitchRefresh: ((switchId: string) => void) | undefined;
    /** The switch IDs of this row with a read that runs now. */
    readonly refreshing: ReadonlySet<string>;
    readonly onDisconnect: (item: ChannelItem) => void;
}
/** One connected account in a `ChannelList`. */
export declare function ChannelRow({ item, labels, onDisconnect, onRename, onSwitchChange, onSwitchRefresh, onTagsChange, readOnly, reconnect, refreshing, switchIds, tagColors, tagSuggestions, }: ChannelRowProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelRow.d.ts.map