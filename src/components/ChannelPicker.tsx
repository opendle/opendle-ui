import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
import type { NetworkName } from "./networks.js";

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

export interface ChannelPickerProps {
  /** The accessible name of the group. */
  readonly label: string;
  readonly items: readonly ChannelPickerItem[];
  /** The selected IDs. */
  readonly value: readonly string[];
  /** The selected IDs, in the order of `items`. */
  readonly onChange: (value: readonly string[]) => void;
  /** Selected channels with a problem get a warning mark. */
  readonly invalid?: ReadonlySet<string>;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * A multiple choice of channels. Each channel is a toggle button with its
 * picture, its network mark and its name.
 */
export function ChannelPicker({
  className,
  disabled = false,
  invalid,
  items,
  label,
  onChange,
  value,
}: ChannelPickerProps) {
  const selected = new Set(value);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(items.flatMap((item) => (next.has(item.id) ? [item.id] : [])));
  };
  return (
    <fieldset
      className={classes("od-channel-picker", className)}
      disabled={disabled}
    >
      <legend className="od-visually-hidden">{label}</legend>
      {items.map((item) => {
        const pressed = selected.has(item.id);
        const warning = pressed && invalid?.has(item.id) === true;
        return (
          <button
            aria-pressed={pressed}
            className="od-channel-picker-item"
            data-invalid={warning || undefined}
            disabled={item.disabled}
            key={item.id}
            onClick={() => {
              toggle(item.id);
            }}
            title={item.detail}
            type="button"
          >
            <span className="od-channel-picker-picture">
              <Avatar name={item.name} shape="circle" src={item.avatarUrl} />
              <NetworkIcon badge network={item.network} />
            </span>
            <span className="od-channel-picker-name">{item.name}</span>
            <span aria-hidden="true" className="od-channel-picker-mark">
              <Icon name={warning ? "alert" : "check"} size={12} />
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
