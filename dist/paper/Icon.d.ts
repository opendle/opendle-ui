import { type SVGAttributes } from "react";
import { iconShapes } from "./iconData.js";
import type { NetworkName } from "./networks.js";
export type IconName = keyof typeof iconShapes;
export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "name"> {
    readonly name: IconName;
    readonly size?: number;
}
/** A decorative stroke icon. Give the control that contains it a name. */
export declare function Icon({ className, name, size, ...props }: IconProps): import("react").JSX.Element;
export interface NetworkIconProps {
    readonly network: NetworkName;
    /** Show the mark in a round tinted badge. */
    readonly badge?: boolean;
    /** Add the network name for assistive technology. */
    readonly labelled?: boolean;
    readonly className?: string;
}
/** The mark of a social network in its brand colour. */
export declare function NetworkIcon({ badge, className, labelled, network, }: NetworkIconProps): import("react").JSX.Element;
//# sourceMappingURL=Icon.d.ts.map