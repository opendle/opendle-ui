import type { ReactNode } from "react";

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
  /** The host connection provider to use instead of native authorization. */
  readonly connectionProvider?: string;
  /** A visible host label for the connection route, for example `via Gateway`. */
  readonly connectionLabel?: string;
}

/** A network that the user can connect. */
export interface ChannelNetwork {
  readonly network: NetworkName;
  readonly label: string;
  /** The address that starts the authorization. Without it, a form shows. */
  readonly href?: string;
}

/** A host-owned connection flow, alongside the native networks. */
export interface ChannelConnectionProvider {
  readonly id: string;
  readonly label: string;
  /** A decorative mark. Without it, a generic connection mark shows. */
  readonly icon?: ReactNode;
  /** Called after the network picker closes. The host owns the next dialog. */
  readonly onSelect: () => void;
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

export const channelListLabels: ChannelListLabels = {
  title: "Channels",
  connect: "Connect",
  connectTitle: "Connect a channel",
  empty: "No channels",
  rename: "Rename",
  tags: "Tags",
  addTag: "Add tag",
  removeTag: "Remove tag",
  reconnect: "Reconnect",
  reconnectNeeded: "Authorization ended",
  disconnect: "Disconnect",
  disconnectTitle: "Disconnect this channel?",
  handle: "Handle",
  password: "App password",
  submit: "Connect",
  back: "Back",
  cancel: "Cancel",
  close: "Close",
};
