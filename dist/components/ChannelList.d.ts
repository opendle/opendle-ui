import { type ChannelItem, type ChannelListLabels, type ChannelNetwork } from "./channelLabels.js";
import type { NetworkName } from "./networks.js";
export interface ChannelListProps {
    readonly items: readonly ChannelItem[];
    /** The networks that the user can connect. */
    readonly networks: readonly ChannelNetwork[];
    /** Show the channels without the controls that change them. */
    readonly readOnly?: boolean;
    /** The colour key, from 1 to 12, of each tag name. */
    readonly tagColors?: Readonly<Record<string, number>>;
    readonly onRename: (id: string, name: string) => Promise<void>;
    readonly onTagsChange: (id: string, tags: readonly string[]) => Promise<void>;
    readonly onSwitchChange: (id: string, switchId: string, on: boolean) => Promise<void>;
    readonly onDisconnect: (id: string) => Promise<void>;
    readonly onPasswordConnect: (network: NetworkName, handle: string, password: string) => Promise<void>;
    readonly errorMessage: (error: unknown) => string | null;
    readonly labels?: ChannelListLabels;
}
/**
 * The connected accounts of the networks: name, tags, switches, the warning
 * for an ended authorization, and the connect and disconnect actions.
 */
export declare function ChannelList({ errorMessage, items, labels, networks, onDisconnect, onPasswordConnect, onRename, onSwitchChange, onTagsChange, readOnly, tagColors, }: ChannelListProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelList.d.ts.map