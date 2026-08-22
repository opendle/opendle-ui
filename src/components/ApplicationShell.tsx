import {
  useId,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

export interface ApplicationShellProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  readonly children: ReactNode;
  readonly sidebar: ReactNode;
  readonly topbar?: ReactNode;
  readonly mobileNavigation: ReactElement;
  readonly mainProps?: HTMLAttributes<HTMLElement>;
}

/** A responsive application frame with caller-owned content and controls. */
export function ApplicationShell({
  children,
  className,
  mainProps,
  mobileNavigation,
  sidebar,
  topbar,
  ...props
}: ApplicationShellProps) {
  const { className: mainClassName, ...restMainProps } = mainProps ?? {};
  return (
    <div
      {...props}
      className={["od-application-shell", className].filter(Boolean).join(" ")}
    >
      {sidebar}
      <div className="od-application-column">
        {topbar}
        <main
          {...restMainProps}
          className={["od-application-main", mainClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </main>
      </div>
      <div className="od-application-mobile-navigation">{mobileNavigation}</div>
    </div>
  );
}

export interface ApplicationSidebarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly brand: ReactNode;
  readonly context?: ReactNode;
  readonly navigation: ReactNode;
  readonly footer?: ReactNode;
}

/** A sticky sidebar with slots for host-owned brand, context, and navigation. */
export function ApplicationSidebar({
  brand,
  className,
  context,
  footer,
  navigation,
  ...props
}: ApplicationSidebarProps) {
  return (
    <aside
      {...props}
      className={["od-application-sidebar", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="od-application-sidebar-brand">{brand}</div>
      {context ? (
        <div className="od-application-sidebar-context">{context}</div>
      ) : null}
      <div className="od-application-sidebar-navigation">{navigation}</div>
      {footer ? (
        <footer className="od-application-sidebar-footer">{footer}</footer>
      ) : null}
    </aside>
  );
}

export interface ApplicationTopbarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "title"
> {
  readonly title: ReactNode;
  readonly leading?: ReactNode;
  readonly actions?: ReactNode;
}

/** A responsive application header with caller-owned title and actions. */
export function ApplicationTopbar({
  actions,
  className,
  leading,
  title,
  ...props
}: ApplicationTopbarProps) {
  return (
    <header
      {...props}
      className={["od-application-topbar", className].filter(Boolean).join(" ")}
    >
      {leading ? (
        <div className="od-application-topbar-leading">{leading}</div>
      ) : null}
      <div className="od-application-topbar-title">{title}</div>
      {actions ? (
        <div className="od-application-topbar-actions">{actions}</div>
      ) : null}
    </header>
  );
}

export interface ApplicationNavigationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly children: ReactNode;
}

/** A scrollable navigation boundary for grouped application destinations. */
export function ApplicationNavigation({
  children,
  className,
  ...props
}: ApplicationNavigationProps) {
  return (
    <nav
      {...props}
      className={["od-application-navigation", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </nav>
  );
}

export interface ApplicationNavigationGroupProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly children: ReactNode;
  readonly label: ReactNode;
}

/** A labelled group inside the primary application navigation. */
export function ApplicationNavigationGroup({
  children,
  className,
  label,
  "aria-labelledby": labelledBy,
  ...props
}: ApplicationNavigationGroupProps) {
  const generatedLabelId = useId();
  return (
    <section
      {...props}
      aria-labelledby={labelledBy ?? generatedLabelId}
      className={["od-application-navigation-group", className]
        .filter(Boolean)
        .join(" ")}
    >
      <p
        className="od-application-navigation-label"
        id={labelledBy === undefined ? generatedLabelId : undefined}
      >
        {label}
      </p>
      <div className="od-application-navigation-items">{children}</div>
    </section>
  );
}
