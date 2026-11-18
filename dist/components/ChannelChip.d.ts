import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { NetworkName } from "./networks.js";
export interface ChannelChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed" | "children" | "name" | "type"> {
    readonly name: string;
    readonly network: NetworkName;
    readonly avatarUrl?: string | null | undefined;
    /** The state of a toggle chip. An unpressed chip shows a grey picture. */
    readonly pressed?: boolean;
    /** Show the chip in the danger colours. */
    readonly invalid?: boolean;
    /** Content after the name, for example a state mark. */
    readonly children?: ReactNode;
}
/**
 * A pill with the channel picture, its network badge and its name. With
 * `onClick`, the chip is a button; with `pressed`, it is a toggle button.
 * Without them, it is static text.
 */
export declare function ChannelChip({ avatarUrl, children, className, invalid, name, network, pressed, ...props }: ChannelChipProps): import("react").JSX.Element;
//# sourceMappingURL=ChannelChip.d.ts.map