import { type ReactNode } from "react";
import { type ChannelConnectionProvider, type ChannelItem, type ChannelListLabels, type ChannelNetwork } from "./channelLabels.js";
import type { NetworkName } from "./networks.js";
export interface ChannelListProps {
    readonly items: readonly ChannelItem[];
    /** The networks that the user can connect. */
    readonly networks: readonly ChannelNetwork[];
    /** Extra host-owned connection flows in the network picker. */
    readonly connectionProviders?: readonly ChannelConnectionProvider[];
    /** Show the channels without the controls that change them. */
    readonly readOnly?: boolean;
    /** Control the connect dialog from the host. */
    readonly connectOpen?: boolean;
    readonly onConnectOpenChange?: (open: boolean) => void;
    /** The colour key, from 1 to 12, of each tag name. */
    readonly tagColors?: Readonly<Record<string, number>>;
    /** Known tags that the tag input of each channel suggests. */
    readonly tagSuggestions?: readonly string[];
    readonly onRename: (id: string, name: string) => Promise<void>;
    readonly onTagsChange: (id: string, tags: readonly string[]) => Promise<void>;
    readonly onSwitchChange: (id: string, switchId: string, on: boolean) => Promise<void>;
    readonly onDisconnect: (id: string) => Promise<void>;
    readonly onPasswordConnect: (network: NetworkName, handle: string, password: string) => Promise<void>;
    /**
     * Give a connected account of a network without an authorization address
     * a new app password. Without it, a reconnection uses `onPasswordConnect`.
     */
    readonly onPasswordReconnect?: (id: string, handle: string, password: string) => Promise<void>;
    /** The title and the effects in the confirmation of a disconnection. */
    readonly disconnectConfirmation?: (item: ChannelItem) => {
        readonly title: ReactNode;
        readonly description: ReactNode;
    };
    readonly errorMessage: (error: unknown) => string | null;
    readonly labels?: ChannelListLabels;
}
/**
 * The connected accounts of the networks: name, tags, switches, the warning
 * for an ended authorization, and the connect and disconnect actions.
 */
export declare function ChannelList({ connectOpen, onConnectOpenChange, connectionProviders, disconnectConfirmation, errorMessage, items, labels, networks, onDisconnect, onPasswordConnect, onPasswordReconnect, onRename, onSwitchChange, onTagsChange, readOnly, tagColors, tagSuggestions, }: ChannelListProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelList.d.ts.map