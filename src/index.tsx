import type {
  HTMLAttributes,
  ReactNode,
  SVGAttributes,
} from "react";

/** Public package version. Keep this value aligned with package.json. */
export const OPENDLE_UI_VERSION = "0.1.0" as const;

export type IconName =
  | "activity"
  | "arrow-up"
  | "audit"
  | "book"
  | "chevron"
  | "clock"
  | "cloud"
  | "database"
  | "eye"
  | "file"
  | "filter"
  | "grid"
  | "health"
  | "key"
  | "layers"
  | "list"
  | "lock"
  | "logout"
  | "menu"
  | "more"
  | "moon"
  | "plus"
  | "refresh"
  | "search"
  | "server"
  | "settings"
  | "shield"
  | "spark"
  | "users"
  | "warning"
  | "workspace";

const iconPaths: Record<IconName, string> = {
  activity: "M3 12h4l2-7 4 14 2-7h6",
  "arrow-up": "M12 19V5m-5 5 5-5 5 5",
  audit: "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z M4 5.5v15",
  chevron: "m6 9 6 6 6-6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  cloud: "M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8a5 5 0 0 0 1 10",
  database: "M4 5c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2z M4 5v7c0 1.1 3.6 2 8 2s8-.9 8-2V5 M4 12v7c0 1.1 3.6 2 8 2s8-.9 8-2v-7",
  eye: "M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Zm9 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  file: "M6 3h8l4 4v14H6z M14 3v5h5 M9 13h6 M9 17h5",
  filter: "M4 6h16M7 12h10m-7 6h4",
  grid: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  health: "M12 21s8-4.3 8-10.2V5.5L12 3 4 5.5v5.3C4 16.7 12 21 12 21z M8 12l2.5 2.5L16 9",
  key: "M15 7a4 4 0 1 0-3.9 5H5v3h3v3h3v-3h2.1A4 4 0 0 0 15 7z M15 7h.01",
  layers: "m12 3 9 5-9 5-9-5z M3 12l9 5 9-5 M3 16l9 5 9-5",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.1M4 12h.1M4 18h.1",
  lock: "M5 10h14v10H5zM8 10V7a4 4 0 0 1 8 0v3",
  logout: "M10 17l5-5-5-5 M15 12H3 M21 19V5a2 2 0 0 0-2-2h-5",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  more: "M5 12h.1M12 12h.1M19 12h.1",
  moon: "M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z",
  plus: "M12 5v14 M5 12h14",
  refresh: "M20 11a8 8 0 0 0-14.7-3.9L3 10 M3 5v5h5 M4 13a8 8 0 0 0 14.7 3.9L21 14 M21 19v-5h-5",
  search: "m21 21-4.3-4.3 M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4z",
  server: "M4 5h16v5H4z M4 14h16v5H4z M7 7.5h.01 M7 16.5h.01 M10 7.5h6 M10 16.5h6",
  settings: "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.5v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H7v-2.5h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.5v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.5 1z",
  shield: "M12 21s8-4.3 8-10.2V5.5L12 3 4 5.5v5.3C4 16.7 12 21 12 21z",
  spark: "m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z M19 17v4 M17 19h4",
  users: "M16 20v-1.5a4.5 4.5 0 0 0-9 0V20 M11.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M17 4.5a3 3 0 0 1 0 5.8 M20 20v-1.2a4 4 0 0 0-2.7-3.8",
  warning: "m12 4 9 16H3l9-16Zm0 5v4m0 3h.1",
  workspace: "M4 5h16v14H4z M4 9h16 M8 5v4",
};

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  readonly name: IconName;
  readonly size?: number;
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  return (
    <svg
      {...props}
      aria-hidden={props["aria-label"] ? undefined : true}
      className={["od-icon", props.className].filter(Boolean).join(" ")}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={props.strokeWidth ?? 1.8}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export type StatusTone = "amber" | "blue" | "green" | "lime" | "red" | "slate";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: StatusTone;
}

export function StatusDot({ tone = "green", className, ...props }: StatusDotProps) {
  return (
    <span
      {...props}
      aria-hidden={props["aria-label"] ? undefined : true}
      className={["od-status-dot", `od-status-${tone}`, className].filter(Boolean).join(" ")}
    />
  );
}

export interface StatusPillProps {
  readonly tone: StatusTone;
  readonly children: ReactNode;
  readonly className?: string;
}

export function StatusPill({ tone, children, className }: StatusPillProps) {
  return (
    <span className={["od-status-pill", `od-status-${tone}`, className].filter(Boolean).join(" ")}>
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}

/** Shared token names. Values are defined in styles/tokens.css. */
export const designTokens = {
  color: {
    background: "--od-color-background",
    foreground: "--od-color-foreground",
    muted: "--od-color-muted",
    mutedStrong: "--od-color-muted-strong",
    accent: "--od-color-accent",
    border: "--od-color-border",
    borderStrong: "--od-color-border-strong",
    surface: "--od-color-surface",
    surfaceRaised: "--od-color-surface-raised",
    sidebar: "--od-color-sidebar",
    sidebarMuted: "--od-color-sidebar-muted",
    lime: "--od-color-lime",
    coral: "--od-color-coral",
    blue: "--od-color-blue",
    purple: "--od-color-purple",
    focus: "--od-color-focus",
    amber: "--od-color-amber",
    limeSoft: "--od-color-lime-soft",
    blueSoft: "--od-color-blue-soft",
    purpleSoft: "--od-color-purple-soft",
    coralSoft: "--od-color-coral-soft",
    amberSoft: "--od-color-amber-soft",
    shadow: "--od-shadow",
  },
  radius: {
    sm: "--od-radius-sm",
    md: "--od-radius-md",
    lg: "--od-radius-lg",
  },
  space: {
    xs: "--od-space-xs",
    sm: "--od-space-sm",
    md: "--od-space-md",
    lg: "--od-space-lg",
    xl: "--od-space-xl",
  },
  font: {
    body: "--od-font-body",
    display: "--od-font-display",
    mono: "--od-font-mono",
  },
} as const;

export { AutoGrowTextarea, type AutoGrowTextareaProps } from "./components/AutoGrowTextarea.js";
export { Button, type ButtonProps, type ButtonVariant } from "./components/Button.js";
export { AccountMenu, type AccountMenuProps } from "./components/AccountMenu.js";
export { AgentSidebar, type AgentSidebarProps } from "./components/AgentSidebar.js";
export { AttentionRow, type AttentionRowProps, type AttentionTone } from "./components/AttentionRow.js";
export { CalendarBoard, type CalendarBoardProps, type CalendarEvent, type CalendarEventState, type CalendarMode } from "./components/CalendarBoard.js";
export { Card, type CardProps } from "./components/Card.js";
export { ChainStep, type ChainStepProps } from "./components/ChainStep.js";
export { ContextItem, type ContextItemProps } from "./components/ContextItem.js";
export { HealthBar, type HealthBarProps } from "./components/HealthBar.js";
export { IconButton, type IconButtonProps } from "./components/IconButton.js";
export { NavigationItem, type NavigationItemProps } from "./components/NavigationItem.js";
export { NavigationLink, type NavigationLinkProps } from "./components/NavigationLink.js";
export { MobileNavigation, type MobileNavigationItem, type MobileNavigationProps } from "./components/MobileNavigation.js";
export { PageHeading, type PageHeadingProps } from "./components/PageHeading.js";
export { Panel, PanelHeader, type PanelHeaderProps, type PanelProps } from "./components/Panel.js";
export { PlanCardShell, type PlanCardShellProps } from "./components/PlanCardShell.js";
export { ReviewPlanCard, type ReviewPlanCardProps, type ReviewPlanDetail, type ReviewPlanState } from "./components/ReviewPlanCard.js";
export { ShellErrorBoundary, type ShellErrorBoundaryProps } from "./components/ShellErrorBoundary.js";
export { StatCard, type StatCardProps } from "./components/StatCard.js";
export { Toast, type ToastProps } from "./components/Toast.js";
export { WorkspaceSelector, type WorkspaceSelectorProps } from "./components/WorkspaceSelector.js";
