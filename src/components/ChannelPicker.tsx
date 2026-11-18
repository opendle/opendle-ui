import { ChannelChip } from "./ChannelChip.js";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import type { NetworkName } from "./networks.js";
import { TagChip } from "./TagChip.js";

export interface ChannelPickerItem {
  readonly id: string;
  readonly network: NetworkName;
  readonly name: string;
  readonly avatarUrl?: string | null;
  /** The channel cannot be selected. `detail` gives the reason. */
  readonly disabled?: boolean;
  /** A short fact, shown as the tooltip, for example the handle. */
  readonly detail?: string;
}

/** A shortcut that selects a set of channels, for example a tag of channels. */
export interface ChannelPickerGroup {
  readonly id: string;
  readonly label: string;
  /** The colour key of the tag chip, from 1 to 12. */
  readonly color?: number;
  readonly channelIds: readonly string[];
  /** The default is true when all channels of the group are selected. */
  readonly pressed?: boolean;
}

/** The group that a click on a shortcut changed. */
export interface ChannelPickerGroupChange {
  readonly id: string;
  /** True when the group is now chosen. */
  readonly pressed: boolean;
}

export interface ChannelPickerProps {
  /** The accessible name of the group. */
  readonly label: string;
  readonly items: readonly ChannelPickerItem[];
  /** The selected IDs. */
  readonly value: readonly string[];
  /**
   * The selected IDs, in the order of `items`. After a click on a group, the
   * second argument names the group.
   */
  readonly onChange: (
    value: readonly string[],
    group?: ChannelPickerGroupChange,
  ) => void;
  /**
   * Shortcuts above the channels. A click on a group that is not chosen
   * selects its channels; a click on a chosen group removes them.
   */
  readonly groups?: readonly ChannelPickerGroup[];
  /** The accessible name of the groups. */
  readonly groupsLabel?: string;
  /** Selected channels with a problem get a warning mark. */
  readonly invalid?: ReadonlySet<string>;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * A multiple choice of channels. Each channel is a toggle button with its
 * picture, its network mark and its name. Optional groups above the channels
 * select a set of channels in one click.
 */
export function ChannelPicker({
  className,
  disabled = false,
  groups,
  groupsLabel = "Groups",
  invalid,
  items,
  label,
  onChange,
  value,
}: ChannelPickerProps) {
  const selected = new Set(value);
  const enabled = new Set(
    items.flatMap((item) => (item.disabled === true ? [] : [item.id])),
  );
  const ordered = (next: ReadonlySet<string>) =>
    items.flatMap((item) => (next.has(item.id) ? [item.id] : []));
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(ordered(next));
  };
  const shortcuts = (groups ?? []).flatMap((group) => {
    const ids = group.channelIds.filter((id) => enabled.has(id));
    if (ids.length === 0) return [];
    const pressed = group.pressed ?? ids.every((id) => selected.has(id));
    return [{ group, ids, pressed }];
  });
  const choose = (id: string, ids: readonly string[], pressed: boolean) => {
    const next = new Set(selected);
    for (const channelId of ids) {
      if (pressed) next.add(channelId);
      else next.delete(channelId);
    }
    onChange(ordered(next), { id, pressed });
  };
  return (
    <fieldset
      className={classes("od-channel-picker", className)}
      disabled={disabled}
    >
      <legend className="od-visually-hidden">{label}</legend>
      {shortcuts.length === 0 ? null : (
        <fieldset aria-label={groupsLabel} className="od-channel-picker-groups">
          {shortcuts.map(({ group, ids, pressed }) => (
            <TagChip
              color={group.color}
              disabled={disabled}
              key={group.id}
              onPressedChange={(next) => {
                choose(group.id, ids, next);
              }}
              pressed={pressed}
            >
              {group.label}
            </TagChip>
          ))}
        </fieldset>
      )}
      {items.map((item) => {
        const pressed = selected.has(item.id);
        const warning = pressed && invalid?.has(item.id) === true;
        return (
          <ChannelChip
            avatarUrl={item.avatarUrl}
            className="od-channel-picker-item"
            disabled={item.disabled}
            invalid={warning}
            key={item.id}
            name={item.name}
            network={item.network}
            onClick={() => {
              toggle(item.id);
            }}
            pressed={pressed}
            title={item.detail}
          >
            <span aria-hidden="true" className="od-channel-picker-mark">
              <Icon name={warning ? "alert" : "check"} size={12} />
            </span>
          </ChannelChip>
        );
      })}
    </fieldset>
  );
}
