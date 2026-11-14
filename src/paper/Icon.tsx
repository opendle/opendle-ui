import { createElement, type SVGAttributes } from "react";

import { iconShapes, networkMarks } from "./iconData.js";
import { classes } from "./classes.js";
import type { NetworkName } from "./networks.js";

export type IconName = keyof typeof iconShapes;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "name"> {
  readonly name: IconName;
  readonly size?: number;
}

/** A decorative stroke icon. Give the control that contains it a name. */
export function Icon({ className, name, size = 18, ...props }: IconProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={classes("pp-icon", className)}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width={size}
    >
      {iconShapes[name].map(([tag, attributes]) =>
        createElement(tag, {
          ...attributes,
          key: `${tag}:${Object.values(attributes).join(",")}`,
        }),
      )}
    </svg>
  );
}

export interface NetworkIconProps {
  readonly network: NetworkName;
  /** Show the mark in a round tinted badge. */
  readonly badge?: boolean;
  /** Add the network name for assistive technology. */
  readonly labelled?: boolean;
  readonly className?: string;
}

/** The mark of a social network in its brand colour. */
export function NetworkIcon({
  badge = false,
  className,
  labelled = false,
  network,
}: NetworkIconProps) {
  const mark = networkMarks[network];
  return (
    <span
      aria-label={labelled ? mark.label : undefined}
      className={classes("pp-network", className)}
      data-badge={badge}
      data-network={network}
      role={labelled ? "img" : undefined}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d={mark.path} />
      </svg>
    </span>
  );
}
