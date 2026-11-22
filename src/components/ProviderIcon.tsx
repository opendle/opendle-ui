import type { SVGAttributes } from "react";

import { classes } from "./classes.js";

/** The marks of services that connect channels for a host. */
const providerMarks = {
  buffer: {
    label: "Buffer",
    path: "M1.371 5.476L11.943 0l10.686 5.476-10.686 5.495zm3.36 4.81l7.212 3.547 7.288-3.547 3.398 1.655-10.686 5.202L1.371 11.94zm0 6.171l7.212 3.911 7.288-3.91 3.398 1.815L11.943 24 1.371 18.273z",
  },
} as const;

export type ProviderName = keyof typeof providerMarks;

export interface ProviderIconProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  "children" | "name"
> {
  readonly provider: ProviderName;
  readonly size?: number;
}

/**
 * The mark of a connection service in the current text colour. It is
 * decorative unless the host gives `aria-label`.
 */
export function ProviderIcon({
  className,
  provider,
  size = 16,
  ...props
}: ProviderIconProps) {
  return (
    <svg
      {...props}
      aria-hidden={props["aria-label"] ? undefined : true}
      className={classes("od-provider-icon", className)}
      fill="currentColor"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={providerMarks[provider].path} />
    </svg>
  );
}
