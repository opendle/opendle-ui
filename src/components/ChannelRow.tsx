import { Button } from "./Button.js";
import type { ChannelItem, ChannelListLabels } from "./channelLabels.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { InlineEditableText } from "./InlineEditableText.js";
import type { NetworkName } from "./networks.js";
import { TagChip } from "./TagChip.js";
import { TagInput } from "./TagInput.js";

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
export function ChannelRow({
  item,
  labels,
  onDisconnect,
  onReconnect,
  onRename,
  onSwitchChange,
  onTagsChange,
  readOnly,
  reconnectHref,
  tagColors,
}: ChannelRowProps) {
  return (
    <li className="od-channel-row" data-warning={item.needsReconnect}>
      <NetworkIcon badge className="od-channel-mark" network={item.network} />
      <span className="od-channel-identity">
        <span className="od-channel-name">
          {readOnly ? (
            item.name
          ) : (
            <InlineEditableText
              label={`${labels.rename}: ${item.name}`}
              maxLength={100}
              onSave={onRename}
              value={item.name}
            />
          )}
        </span>
        <span className="od-channel-details">
          <span className="od-channel-handle">
            {item.needsReconnect ? (
              <span className="od-channel-warning">
                <Icon name="alert" size={13} />
                {labels.reconnectNeeded}
              </span>
            ) : (
              item.handle
            )}
          </span>
          {item.connectionLabel ? (
            <span className="od-channel-provider">{item.connectionLabel}</span>
          ) : null}
        </span>
      </span>
      <TagInput
        className="od-channel-tags"
        {...(tagColors === undefined ? {} : { colors: tagColors })}
        disabled={readOnly}
        label={`${labels.tags}: ${item.name}`}
        onChange={onTagsChange}
        placeholder={labels.addTag}
        removeLabel={labels.removeTag}
        value={item.tags}
      />
      <span className="od-channel-switches">
        {item.switches.map((entry) =>
          readOnly ? (
            entry.on ? (
              <TagChip key={entry.id}>{entry.label}</TagChip>
            ) : null
          ) : (
            <TagChip
              disabled={entry.disabled ?? false}
              title={entry.disabledReason}
              key={entry.id}
              onPressedChange={(on) => {
                onSwitchChange(entry.id, on);
              }}
              pressed={entry.on}
            >
              {entry.label}
            </TagChip>
          ),
        )}
      </span>
      {readOnly ? null : (
        <span className="od-channel-actions">
          {!item.needsReconnect ? null : reconnectHref === null ? (
            <Button
              onClick={() => {
                onReconnect(item.network);
              }}
              size="small"
              variant="secondary"
            >
              {labels.reconnect}
            </Button>
          ) : (
            <a
              className="od-button od-button-secondary"
              data-size="small"
              href={reconnectHref}
            >
              {labels.reconnect}
            </a>
          )}
          <IconButton
            icon={<Icon name="trash" />}
            label={`${labels.disconnect}: ${item.name}`}
            onClick={() => {
              onDisconnect(item);
            }}
            tone="danger"
          />
        </span>
      )}
    </li>
  );
}
