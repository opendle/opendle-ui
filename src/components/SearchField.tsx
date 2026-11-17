import type { InputHTMLAttributes, Ref } from "react";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";

export interface SearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "aria-label"
> {
  /** The accessible name. It is also the placeholder unless one is given. */
  readonly label: string;
  readonly ref?: Ref<HTMLInputElement>;
}

/** A compact search input with a search icon, for a toolbar or a list header. */
export function SearchField({
  className,
  label,
  placeholder,
  ref,
  ...props
}: SearchFieldProps) {
  return (
    <span className={classes("od-search-field", className)}>
      <Icon name="search" size={16} />
      <input
        {...props}
        aria-label={label}
        placeholder={placeholder ?? label}
        ref={ref}
        type="search"
      />
    </span>
  );
}
