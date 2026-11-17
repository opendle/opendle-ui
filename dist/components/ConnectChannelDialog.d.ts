import type { ChannelConnectionProvider, ChannelListLabels, ChannelNetwork } from "./channelLabels.js";
import type { NetworkName } from "./networks.js";
export interface ConnectChannelDialogProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly networks: readonly ChannelNetwork[];
    readonly connectionProviders?: readonly ChannelConnectionProvider[];
    /** Open the form of this network at once, for a new connection of it. */
    readonly network?: NetworkName | null;
    /** Connect a network that has no authorization address. */
    readonly onPasswordConnect: (network: NetworkName, handle: string, password: string) => Promise<void>;
    readonly errorMessage: (error: unknown) => string | null;
    readonly labels: ChannelListLabels;
    /** The first value of the handle field. */
    readonly handle?: string;
    /** A title in place of the network name, for example for a reconnection. */
    readonly title?: string;
}
/** Select a network, then go to its authorization or give an app password. */
export declare function ConnectChannelDialog({ connectionProviders, errorMessage, handle: initialHandle, labels, network, networks, onClose, onPasswordConnect, open, title, }: ConnectChannelDialogProps): import("react").JSX.Element;
//# sourceMappingURL=ConnectChannelDialog.d.ts.map