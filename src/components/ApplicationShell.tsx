import {
  useCallback,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { classes } from "./classes.js";
import { Dialog } from "./Dialog.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { NavigationItem } from "./NavigationItem.js";

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
  /**
   * A second, longer list below the main one, for example the channels. It
   * scrolls. On a phone it opens from one button of the bottom bar.
   */
  readonly secondaryNavigation?: ReactNode;
  readonly secondaryNavigationLabel?: string;
  /** A workspace menu above the main navigation. */
  readonly workspace?: ReactNode;
  /** An `AccountMenu` element at the end of the sidebar. */
  readonly account?: ReactNode;
  /** Show the sidebar as an icon rail. */
  readonly collapsed?: boolean;
  /** With it, a button next to the account collapses the sidebar. */
  readonly onCollapsedChange?: (collapsed: boolean) => void;
  readonly collapseLabel?: string;
  readonly expandLabel?: string;
  readonly closeLabel?: string;
  readonly skipLabel: string;
  readonly children: ReactNode;
  readonly mainProps?: HTMLAttributes<HTMLElement>;
}

const mainId = "od-main";
const listIcon = <Icon name="layers" />;
const panelIcon = <Icon name="panel-left" />;

/**
 * The application frame: a left sidebar that becomes an icon rail on a medium
 * window, or when the user collapses it, and a bottom bar on a phone.
 */
export function ApplicationShell({
  account,
  brandHref = "/",
  brandMark,
  brandName,
  children,
  className,
  closeLabel = "Close",
  collapsed = false,
  collapseLabel = "Collapse the sidebar",
  expandLabel = "Expand the sidebar",
  mainProps,
  navigation,
  navigationLabel,
  onCollapsedChange,
  secondaryNavigation,
  secondaryNavigationLabel = "",
  skipLabel,
  workspace,
  ...props
}: ApplicationShellProps) {
  const [listOpen, setListOpen] = useState(false);
  // A used link of the sheet closes the sheet.
  const closeAfterLink = useCallback((list: HTMLElement | null) => {
    if (list === null) return undefined;
    const close = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        setListOpen(false);
      }
    };
    list.addEventListener("click", close);
    return () => {
      list.removeEventListener("click", close);
    };
  }, []);
  const hasSecondary =
    secondaryNavigation !== undefined && secondaryNavigation !== null;
  return (
    <div
      {...props}
      className={classes("od-application-shell", className)}
      data-collapsed={collapsed}
    >
      <a className="od-skip-link" href={`#${mainId}`}>
        {skipLabel}
      </a>
      <aside className="od-application-sidebar">
        <a className="od-application-brand" href={brandHref}>
          {brandMark}
          <span className="od-application-brand-name">{brandName}</span>
        </a>
        {workspace === undefined || workspace === null ? null : (
          <div className="od-application-workspace">{workspace}</div>
        )}
        <nav aria-label={navigationLabel} className="od-application-navigation">
          {navigation}
          {hasSecondary ? (
            <NavigationItem
              className="od-application-list-button"
              icon={listIcon}
              label={secondaryNavigationLabel}
              onClick={() => {
                setListOpen(true);
              }}
            />
          ) : null}
        </nav>
        {hasSecondary ? (
          <nav
            aria-label={secondaryNavigationLabel}
            className="od-application-navigation od-application-secondary"
          >
            {secondaryNavigation}
          </nav>
        ) : null}
        <div className="od-application-footer">
          {account}
          {onCollapsedChange === undefined ? null : (
            <IconButton
              aria-pressed={collapsed}
              className="od-application-collapse"
              icon={panelIcon}
              label={collapsed ? expandLabel : collapseLabel}
              onClick={() => {
                onCollapsedChange(!collapsed);
              }}
            />
          )}
        </div>
      </aside>
      <main
        {...mainProps}
        className={classes("od-application-main", mainProps?.className)}
        id={mainId}
        tabIndex={-1}
      >
        {children}
      </main>
      {hasSecondary ? (
        <Dialog
          bodyClassName="od-application-list-body"
          className="od-application-list"
          closeLabel={closeLabel}
          onClose={() => {
            setListOpen(false);
          }}
          open={listOpen}
          size="narrow"
          title={secondaryNavigationLabel}
        >
          <nav
            aria-label={secondaryNavigationLabel}
            className="od-application-navigation"
            ref={closeAfterLink}
          >
            {secondaryNavigation}
          </nav>
        </Dialog>
      ) : null}
    </div>
  );
}
