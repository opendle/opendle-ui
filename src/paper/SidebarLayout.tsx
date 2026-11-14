import type { ReactNode } from "react";

import { classes } from "./classes.js";

export interface SidebarLayoutProps {
  /** The product mark, shown before the product name. */
  readonly brandMark: ReactNode;
  readonly brandName: string;
  readonly brandHref?: string;
  /** `SidebarItem` elements. */
  readonly navigation: ReactNode;
  readonly navigationLabel: string;
  /** A `SidebarAccount` element. */
  readonly account?: ReactNode;
  readonly skipLabel: string;
  readonly children: ReactNode;
  readonly className?: string;
}

const mainId = "pp-main";

/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window and a bottom bar on a phone.
 */
export function SidebarLayout({
  account,
  brandHref = "/",
  brandMark,
  brandName,
  children,
  className,
  navigation,
  navigationLabel,
  skipLabel,
}: SidebarLayoutProps) {
  return (
    <div className={classes("pp-shell", className)}>
      <a className="pp-skip-link" href={`#${mainId}`}>
        {skipLabel}
      </a>
      <aside className="pp-sidebar">
        <a className="pp-sidebar-brand" href={brandHref}>
          {brandMark}
          <span className="pp-sidebar-brand-name">{brandName}</span>
        </a>
        <nav aria-label={navigationLabel} className="pp-sidebar-nav">
          {navigation}
        </nav>
        {account}
      </aside>
      <main className="pp-main" id={mainId} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
