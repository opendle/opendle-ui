import type { ChannelItem, ChannelListLabels } from "./channelLabels.js";
export interface ChannelRowProps {
    readonly item: ChannelItem;
    readonly labels: ChannelListLabels;
    readonly readOnly: boolean;
    readonly tagColors: Readonly<Record<string, number>> | undefined;
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
    readonly onDisconnect: (item: ChannelItem) => void;
}
/** One connected account in a `ChannelList`. */
export declare function ChannelRow({ item, labels, onDisconnect, onRename, onSwitchChange, onTagsChange, readOnly, reconnect, tagColors, }: ChannelRowProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelRow.d.ts.map