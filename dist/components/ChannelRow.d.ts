import type { ChannelItem, ChannelListLabels } from "./channelLabels.js";
import type { NetworkName } from "./networks.js";
export interface ChannelRowProps {
    readonly item: ChannelItem;
    readonly labels: ChannelListLabels;
    readonly readOnly: boolean;
    readonly tagColors: Readonly<Record<string, number>> | undefined;
    /** The authorization address of the network, or `null` for a form. */
    readonly reconnectHref: string | null;
    readonly onRename: (name: string) => Promise<void>;
    readonly onTagsChange: (tags: readonly string[]) => void;
    readonly onSwitchChange: (switchId: string, on: boolean) => void;
    readonly onReconnect: (network: NetworkName) => void;
    readonly onDisconnect: (item: ChannelItem) => void;
}
/** One connected account in a `ChannelList`. */
export declare function ChannelRow({ item, labels, onDisconnect, onReconnect, onRename, onSwitchChange, onTagsChange, readOnly, reconnectHref, tagColors, }: ChannelRowProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelRow.d.ts.map