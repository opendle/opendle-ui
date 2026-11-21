import { ActionMenu, type ActionMenuItem } from "./ActionMenu.js";
import { Button } from "./Button.js";
import type { ChannelItem, ChannelListLabels } from "./channelLabels.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { InlineEditableText } from "./InlineEditableText.js";
import { TagChip } from "./TagChip.js";
import { TagInput } from "./TagInput.js";

export interface ChannelRowProps {
  readonly item: ChannelItem;
  readonly labels: ChannelListLabels;
  readonly readOnly: boolean;
  readonly tagColors: Readonly<Record<string, number>> | undefined;
  /** Known tags that the tag input suggests. */
  readonly tagSuggestions: readonly string[] | undefined;
  /**
   * How to connect the account again: an authorization address, a host flow,
   * or `null` when the user cannot connect it from here.
   */
  readonly reconnect: { readonly href: string } | (() => void) | null;
  readonly onRename: (name: string) => Promise<void>;
  readonly onTagsChange: (tags: readonly string[]) => void;
  readonly onSwitchChange: (switchId: string, on: boolean) => void;
  readonly onDisconnect: (item: ChannelItem) => void;
}

/** One connected account in a `ChannelList`. */
export function ChannelRow({
  item,
  labels,
  onDisconnect,
  onRename,
  onSwitchChange,
  onTagsChange,
  readOnly,
  reconnect,
  tagColors,
  tagSuggestions,
}: ChannelRowProps) {
  const actions: readonly ActionMenuItem[] = [
    ...(reconnect === null
      ? []
      : [
          {
            id: "reconnect",
            label: labels.reconnect,
            icon: <Icon name="retry" size={15} />,
            ...(typeof reconnect === "function"
              ? { onSelect: reconnect }
              : { href: reconnect.href }),
          },
        ]),
    {
      id: "disconnect",
      label: labels.disconnect,
      icon: <Icon name="trash" size={15} />,
      tone: "danger",
      onSelect: () => {
        onDisconnect(item);
      },
    },
  ];
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
        {...(tagSuggestions === undefined
          ? {}
          : { suggestions: tagSuggestions })}
        addLabel={labels.addTag}
        disabled={readOnly}
        label={`${labels.tags}: ${item.name}`}
        onChange={onTagsChange}
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
              unavailable={entry.disabled ?? false}
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
          {!item.needsReconnect ||
          reconnect === null ? null : typeof reconnect === "function" ? (
            <Button onClick={reconnect} size="small" variant="secondary">
              {labels.reconnect}
            </Button>
          ) : (
            <a
              className="od-button od-button-secondary"
              data-size="small"
              href={reconnect.href}
            >
              {labels.reconnect}
            </a>
          )}
          <ActionMenu
            items={actions}
            label={`${labels.moreActions}: ${item.name}`}
          />
        </span>
      )}
    </li>
  );
}
