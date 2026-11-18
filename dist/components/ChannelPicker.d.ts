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
    readonly onChange: (value: readonly string[], group?: ChannelPickerGroupChange) => void;
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
export declare function ChannelPicker({ className, disabled, groups, groupsLabel, invalid, items, label, onChange, value, }: ChannelPickerProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelPicker.d.ts.map