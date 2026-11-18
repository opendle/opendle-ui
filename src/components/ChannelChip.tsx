import type { ButtonHTMLAttributes, ReactNode } from "react";

import { ChannelAvatar } from "./ChannelAvatar.js";
import { classes } from "./classes.js";
import type { NetworkName } from "./networks.js";

export interface ChannelChipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-pressed" | "children" | "name" | "type"
> {
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
export function ChannelChip({
  avatarUrl,
  children,
  className,
  invalid = false,
  name,
  network,
  pressed,
  ...props
}: ChannelChipProps) {
  const content = (
    <>
      <ChannelAvatar name={name} network={network} src={avatarUrl} />
      <span className="od-channel-chip-name">{name}</span>
      {children}
    </>
  );
  if (props.onClick === undefined && pressed === undefined)
    return (
      <span
        className={classes("od-channel-chip", className)}
        data-invalid={invalid || undefined}
        title={props.title}
      >
        {content}
      </span>
    );
  return (
    <button
      aria-pressed={pressed}
      className={classes("od-channel-chip", className)}
      data-invalid={invalid || undefined}
      {...props}
      type="button"
    >
      {content}
    </button>
  );
}
