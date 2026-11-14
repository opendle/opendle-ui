import type { HTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export interface ApplicationShellProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** The product mark, shown before the product name. */
  readonly brandMark: ReactNode;
  readonly brandName: string;
  readonly brandHref?: string;
  /** `NavigationLink` or `NavigationItem` elements. */
  readonly navigation: ReactNode;
  readonly navigationLabel: string;
  /** An `AccountMenu` element at the end of the sidebar. */
  readonly account?: ReactNode;
  readonly skipLabel: string;
  readonly children: ReactNode;
  readonly mainProps?: HTMLAttributes<HTMLElement>;
}

const mainId = "od-main";

/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window and a bottom bar on a phone.
 */
export function ApplicationShell({
  account,
  brandHref = "/",
  brandMark,
  brandName,
  children,
  className,
  mainProps,
  navigation,
  navigationLabel,
  skipLabel,
  ...props
}: ApplicationShellProps) {
  return (
    <div {...props} className={classes("od-application-shell", className)}>
      <a className="od-skip-link" href={`#${mainId}`}>
        {skipLabel}
      </a>
      <aside className="od-application-sidebar">
        <a className="od-application-brand" href={brandHref}>
          {brandMark}
          <span className="od-application-brand-name">{brandName}</span>
        </a>
        <nav aria-label={navigationLabel} className="od-application-navigation">
          {navigation}
        </nav>
        {account}
      </aside>
      <main
        {...mainProps}
        className={classes("od-application-main", mainProps?.className)}
        id={mainId}
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
