import type { NetworkName } from "./networks.js";
export interface ChannelAvatarProps {
    /** The channel name. The first letter shows when there is no picture. */
    readonly name: string;
    readonly network: NetworkName;
    readonly src?: string | null | undefined;
    /** Small is 24 px, default is 32 px, large is 44 px. */
    readonly size?: "small" | "default" | "large";
    readonly className?: string;
}
/**
 * The round picture of a channel with the badge of its network at the bottom
 * right. The network name is the accessible name of the badge.
 */
export declare function ChannelAvatar({ className, name, network, size, src, }: ChannelAvatarProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelAvatar.d.ts.map