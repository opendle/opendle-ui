import { type ReactNode } from "react";
import { type ChannelConfirmation, type ChannelConnectionProvider, type ChannelItem, type ChannelListLabels, type ChannelNetwork } from "./channelLabels.js";
import type { NetworkName } from "./networks.js";
export interface ChannelListProps {
    readonly items: readonly ChannelItem[];
    /** Show a loading sign in place of the empty list until the first answer. */
    readonly loading?: boolean;
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
    /**
     * Read a function of the channel now, also when its switch is off. The
     * switches with `sync` then show a read button.
     */
    readonly onSwitchRefresh?: (id: string, switchId: string) => Promise<void>;
    /**
     * A confirmation before a switch change, for example for a read that costs
     * money. `null` changes the switch at once.
     */
    readonly switchConfirmation?: (item: ChannelItem, switchId: string, on: boolean) => ChannelConfirmation | null;
    /** A confirmation before a read now. `null` reads at once. */
    readonly refreshConfirmation?: (item: ChannelItem, switchId: string) => ChannelConfirmation | null;
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
    /**
     * Show a failure outside the component, for example in a toast. With it,
     * the component shows no failure of its own.
     */
    readonly onError?: (message: string) => void;
    readonly labels?: ChannelListLabels;
}
/**
 * The connected accounts of the networks: name, tags, switches, the warning
 * for an ended authorization, and the connect and disconnect actions.
 */
export declare function ChannelList({ connectOpen, onConnectOpenChange, connectionProviders, disconnectConfirmation, errorMessage, items, labels, loading, networks, onDisconnect, onError, onPasswordConnect, onPasswordReconnect, onRename, onSwitchChange, onSwitchRefresh, onTagsChange, readOnly, refreshConfirmation, switchConfirmation, tagColors, tagSuggestions, }: ChannelListProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelList.d.ts.map