import { useState, type CSSProperties, type ReactNode } from "react";

import { Button } from "./Button.js";
import { Card } from "./Card.js";
import {
  channelListLabels,
  type ChannelConfirmation,
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
import { LoadingIndicator } from "./LoadingIndicator.js";
import type { NetworkName } from "./networks.js";
import { Section } from "./Section.js";
import { useAsyncAction } from "./useAsyncAction.js";

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
  readonly onSwitchChange: (
    id: string,
    switchId: string,
    on: boolean,
  ) => Promise<void>;
  /**
   * Read a function of the channel now, also when its switch is off. The
   * switches with `sync` then show a read button.
   */
  readonly onSwitchRefresh?: (id: string, switchId: string) => Promise<void>;
  /**
   * A confirmation before a switch change, for example for a read that costs
   * money. `null` changes the switch at once.
   */
  readonly switchConfirmation?: (
    item: ChannelItem,
    switchId: string,
    on: boolean,
  ) => ChannelConfirmation | null;
  /** A confirmation before a read now. `null` reads at once. */
  readonly refreshConfirmation?: (
    item: ChannelItem,
    switchId: string,
  ) => ChannelConfirmation | null;
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
  /**
   * Show a failure outside the component, for example in a toast. With it,
   * the component shows no failure of its own.
   */
  readonly onError?: (message: string) => void;
  readonly labels?: ChannelListLabels;
}

type Connection = {
  readonly network: NetworkName | null;
  /** The connected account that the user connects again. */
  readonly item?: ChannelItem;
} | null;

const noConnectionProviders: readonly ChannelConnectionProvider[] = [];
const noRefreshes: ReadonlySet<string> = new Set();

/** A confirmed change that waits for the answer of the user. */
interface Pending extends ChannelConfirmation {
  readonly run: () => void;
}

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
  loading = false,
  networks,
  onDisconnect,
  onError,
  onPasswordConnect,
  onPasswordReconnect,
  onRename,
  onSwitchChange,
  onSwitchRefresh,
  onTagsChange,
  readOnly = false,
  refreshConfirmation,
  switchConfirmation,
  tagColors,
  tagSuggestions,
}: ChannelListProps) {
  const change = useAsyncAction(errorMessage, onError);
  const removal = useAsyncAction(errorMessage, onError);
  const [connection, setConnection] = useState<Connection>(null);
  const [removing, setRemoving] = useState<ChannelItem | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  // The reads that run now, as `channel ID` and `switch ID` pairs.
  const [refreshing, setRefreshing] = useState<
    ReadonlyMap<string, ReadonlySet<string>>
  >(new Map());
  const { run } = change;

  /** Run the change at once, or after the confirmation of the host. */
  const confirmThen = (
    confirmation: ChannelConfirmation | null | undefined,
    work: () => void,
  ) => {
    if (confirmation === null || confirmation === undefined) work();
    else setPending({ ...confirmation, run: work });
  };

  const markRefresh = (id: string, switchId: string, on: boolean) => {
    setRefreshing((current) => {
      const ids = new Set(current.get(id));
      if (on) ids.add(switchId);
      else ids.delete(switchId);
      const next = new Map(current);
      if (ids.size === 0) next.delete(id);
      else next.set(id, ids);
      return next;
    });
  };

  const refresh =
    onSwitchRefresh === undefined
      ? undefined
      : (item: ChannelItem, switchId: string) => {
          confirmThen(refreshConfirmation?.(item, switchId), () => {
            markRefresh(item.id, switchId, true);
            void run(() => onSwitchRefresh(item.id, switchId)).finally(() => {
              markRefresh(item.id, switchId, false);
            });
          });
        };

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
  // Each switch has one column, so the switches of all rows align.
  const switchIds = [
    ...new Set(items.flatMap((item) => item.switches.map(({ id }) => id))),
  ];
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
        {items.length === 0 && loading ? (
          <LoadingIndicator block label={labels.loading} />
        ) : items.length === 0 ? (
          <p className="od-list-empty">{labels.empty}</p>
        ) : (
          <div className="od-channel-table">
            <ul
              className="od-channel-list"
              style={
                {
                  "--od-channel-switch-columns": Math.max(1, switchIds.length),
                } as CSSProperties
              }
            >
              {items.map((item) => (
                <ChannelRow
                  switchIds={switchIds}
                  item={item}
                  key={item.id}
                  labels={labels}
                  onDisconnect={setRemoving}
                  onRename={(name) => guarded(() => onRename(item.id, name))}
                  onSwitchChange={(switchId, on) => {
                    confirmThen(
                      switchConfirmation?.(item, switchId, on),
                      () => {
                        void run(() => onSwitchChange(item.id, switchId, on));
                      },
                    );
                  }}
                  onSwitchRefresh={
                    refresh === undefined
                      ? undefined
                      : (switchId) => {
                          refresh(item, switchId);
                        }
                  }
                  onTagsChange={(tags) => {
                    void run(() => onTagsChange(item.id, tags));
                  }}
                  readOnly={readOnly}
                  reconnect={reconnectOf(item)}
                  refreshing={refreshing.get(item.id) ?? noRefreshes}
                  tagColors={tagColors}
                  tagSuggestions={tagSuggestions}
                />
              ))}
            </ul>
          </div>
        )}
      </Card>
      <ConnectChannelDialog
        connectionProviders={connectionProviders}
        errorMessage={errorMessage}
        key={reconnecting?.id ?? ""}
        {...(onError === undefined ? {} : { onError })}
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
        confirmLabel={pending?.confirmLabel ?? ""}
        description={pending?.description ?? ""}
        onCancel={() => {
          setPending(null);
        }}
        onConfirm={() => {
          if (pending === null) return;
          setPending(null);
          pending.run();
        }}
        open={pending !== null}
        title={pending?.title ?? ""}
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
