import type { NetworkName } from "./networks.js";
export interface ChannelSwitch {
    readonly id: string;
    readonly label: string;
    readonly on: boolean;
    readonly disabled?: boolean;
    readonly disabledReason?: string;
}
/** One connected account of a network. */
export interface ChannelItem {
    readonly id: string;
    readonly network: NetworkName;
    readonly name: string;
    /** The account on the network, for example `@name`. */
    readonly handle: string;
    readonly tags: readonly string[];
    /** The authorization ended. The user must connect the account again. */
    readonly needsReconnect: boolean;
    readonly switches: readonly ChannelSwitch[];
}
/** A network that the user can connect. */
export interface ChannelNetwork {
    readonly network: NetworkName;
    readonly label: string;
    /** The address that starts the authorization. Without it, a form shows. */
    readonly href?: string;
}
export interface ChannelListLabels {
    readonly title: string;
    readonly connect: string;
    readonly connectTitle: string;
    readonly empty: string;
    readonly rename: string;
    readonly tags: string;
    readonly addTag: string;
    readonly removeTag: string;
    readonly reconnect: string;
    readonly reconnectNeeded: string;
    readonly disconnect: string;
    readonly disconnectTitle: string;
    readonly handle: string;
    readonly password: string;
    readonly submit: string;
    readonly back: string;
    readonly cancel: string;
    readonly close: string;
}
export declare const channelListLabels: ChannelListLabels;
//# sourceMappingURL=channelLabels.d.ts.map