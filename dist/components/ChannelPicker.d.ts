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
export declare function ChannelPicker({ className, disabled, invalid, items, label, onChange, value, }: ChannelPickerProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelPicker.d.ts.map