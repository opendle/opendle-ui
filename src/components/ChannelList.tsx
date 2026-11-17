import { useState, type ReactNode } from "react";

import { Button } from "./Button.js";
import { Card } from "./Card.js";
import {
  channelListLabels,
  type ChannelConnectionProvider,
  type ChannelItem,
  type ChannelListLabels,
  type ChannelNetwork,
} from "./channelLabels.js";
import { ChannelRow } from "./ChannelRow.js";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { ConnectChannelDialog } from "./ConnectChannelDialog.js";
import { Icon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import type { NetworkName } from "./networks.js";
import { Section } from "./Section.js";
import { useAsyncAction } from "./useAsyncAction.js";

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
  readonly onRename: (id: string, name: string) => Promise<void>;
  readonly onTagsChange: (id: string, tags: readonly string[]) => Promise<void>;
  readonly onSwitchChange: (
    id: string,
    switchId: string,
    on: boolean,
  ) => Promise<void>;
  readonly onDisconnect: (id: string) => Promise<void>;
  readonly onPasswordConnect: (
    network: NetworkName,
    handle: string,
    password: string,
  ) => Promise<void>;
  /**
   * Give a connected account of a network without an authorization address
   * a new app password. Without it, a reconnection uses `onPasswordConnect`.
   */
  readonly onPasswordReconnect?: (
    id: string,
    handle: string,
    password: string,
  ) => Promise<void>;
  /** The title and the effects in the confirmation of a disconnection. */
  readonly disconnectConfirmation?: (item: ChannelItem) => {
    readonly title: ReactNode;
    readonly description: ReactNode;
  };
  readonly errorMessage: (error: unknown) => string | null;
  readonly labels?: ChannelListLabels;
}

type Connection = {
  readonly network: NetworkName | null;
  /** The connected account that the user connects again. */
  readonly item?: ChannelItem;
} | null;

const noConnectionProviders: readonly ChannelConnectionProvider[] = [];

/**
 * The connected accounts of the networks: name, tags, switches, the warning
 * for an ended authorization, and the connect and disconnect actions.
 */
export function ChannelList({
  connectOpen,
  onConnectOpenChange,
  connectionProviders = noConnectionProviders,
  disconnectConfirmation,
  errorMessage,
  items,
  labels = channelListLabels,
  networks,
  onDisconnect,
  onPasswordConnect,
  onPasswordReconnect,
  onRename,
  onSwitchChange,
  onTagsChange,
  readOnly = false,
  tagColors,
}: ChannelListProps) {
  const change = useAsyncAction(errorMessage);
  const removal = useAsyncAction(errorMessage);
  const [connection, setConnection] = useState<Connection>(null);
  const [removing, setRemoving] = useState<ChannelItem | null>(null);
  const { run } = change;

  const guarded = async (work: () => Promise<void>) => {
    const done = await run(work);
    if (!done) throw new Error("The channel change was not stored.");
  };

  const reconnectOf = (
    item: ChannelItem,
  ): { readonly href: string } | (() => void) | null => {
    if (item.connectionProvider !== undefined) {
      const provider = connectionProviders.find(
        (entry) => entry.id === item.connectionProvider,
      );
      if (provider === undefined) return null;
      return () => {
        if (provider.onReconnect === undefined) provider.onSelect();
        else provider.onReconnect(item);
      };
    }
    const network = networks.find((entry) => entry.network === item.network);
    const href = item.reconnectHref ?? network?.href;
    if (href !== undefined) return { href };
    if (network === undefined) return null;
    return () => {
      setConnection({ network: item.network, item });
      onConnectOpenChange?.(true);
    };
  };
  const reconnecting = connection?.item;
  const confirmation =
    removing === null
      ? null
      : (disconnectConfirmation?.(removing) ?? {
          title: labels.disconnectTitle,
          description: removing.name,
        });

  return (
    <Section
      actions={
        readOnly ||
        (networks.length === 0 && connectionProviders.length === 0) ? null : (
          <Button
            icon={<Icon name="plus" size={15} />}
            onClick={() => {
              setConnection({ network: null });
              onConnectOpenChange?.(true);
            }}
            variant="secondary"
          >
            {labels.connect}
          </Button>
        )
      }
      title={labels.title}
    >
      {change.failure === null ? null : (
        <InlineAlert className="od-section-alert" tone="error">
          {change.failure}
        </InlineAlert>
      )}
      <Card>
        {items.length === 0 ? (
          <p className="od-list-empty">{labels.empty}</p>
        ) : (
          <ul className="od-channel-list">
            {items.map((item) => (
              <ChannelRow
                item={item}
                key={item.id}
                labels={labels}
                onDisconnect={setRemoving}
                onRename={(name) => guarded(() => onRename(item.id, name))}
                onSwitchChange={(switchId, on) => {
                  void run(() => onSwitchChange(item.id, switchId, on));
                }}
                onTagsChange={(tags) => {
                  void run(() => onTagsChange(item.id, tags));
                }}
                readOnly={readOnly}
                reconnect={reconnectOf(item)}
                tagColors={tagColors}
              />
            ))}
          </ul>
        )}
      </Card>
      <ConnectChannelDialog
        connectionProviders={connectionProviders}
        errorMessage={errorMessage}
        key={reconnecting?.id ?? ""}
        labels={labels}
        network={connection?.network ?? null}
        networks={networks}
        onClose={() => {
          setConnection(null);
          onConnectOpenChange?.(false);
        }}
        onPasswordConnect={
          reconnecting === undefined || onPasswordReconnect === undefined
            ? onPasswordConnect
            : (_network, handle, password) =>
                onPasswordReconnect(reconnecting.id, handle, password)
        }
        open={!readOnly && (connectOpen ?? connection !== null)}
        {...(reconnecting === undefined
          ? {}
          : {
              handle: reconnecting.handle,
              title: `${labels.reconnect} ${reconnecting.name}`,
            })}
      />
      <ConfirmationDialog
        cancelLabel={labels.cancel}
        confirmLabel={labels.disconnect}
        description={confirmation?.description ?? ""}
        error={removal.failure}
        onCancel={() => {
          removal.reset();
          setRemoving(null);
        }}
        onConfirm={() => {
          if (removing === null) return;
          void removal
            .run(() => onDisconnect(removing.id))
            .then((done) => {
              if (done) setRemoving(null);
            });
        }}
        open={removing !== null}
        pending={removal.pending}
        pendingLabel={labels.disconnect}
        title={confirmation?.title ?? labels.disconnectTitle}
        tone="danger"
      />
    </Section>
  );
}
