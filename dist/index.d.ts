import type { SVGAttributes } from "react";
/** Public package version. Keep this value aligned with package.json. */
export declare const OPENDLE_UI_VERSION: "0.1.0";
export type IconName = "activity" | "arrow-up" | "audit" | "book" | "chevron" | "clock" | "cloud" | "database" | "eye" | "file" | "filter" | "grid" | "health" | "key" | "layers" | "list" | "lock" | "logout" | "menu" | "more" | "moon" | "plus" | "refresh" | "search" | "server" | "settings" | "shield" | "spark" | "users" | "warning" | "workspace";
export interface IconProps extends SVGAttributes<SVGSVGElement> {
    readonly name: IconName;
    readonly size?: number;
}
export declare function Icon({ name, size, ...props }: IconProps): import("react").JSX.Element;
/** Shared token names. Values are defined in styles/tokens.css. */
export declare const designTokens: {
    readonly color: {
        readonly background: "--od-color-background";
        readonly foreground: "--od-color-foreground";
        readonly muted: "--od-color-muted";
        readonly mutedStrong: "--od-color-muted-strong";
        readonly accent: "--od-color-accent";
        readonly border: "--od-color-border";
        readonly borderStrong: "--od-color-border-strong";
        readonly surface: "--od-color-surface";
        readonly surfaceRaised: "--od-color-surface-raised";
        readonly sidebar: "--od-color-sidebar";
        readonly sidebarMuted: "--od-color-sidebar-muted";
        readonly lime: "--od-color-lime";
        readonly coral: "--od-color-coral";
        readonly blue: "--od-color-blue";
        readonly purple: "--od-color-purple";
        readonly focus: "--od-color-focus";
        readonly amber: "--od-color-amber";
        readonly limeSoft: "--od-color-lime-soft";
        readonly blueSoft: "--od-color-blue-soft";
        readonly purpleSoft: "--od-color-purple-soft";
        readonly coralSoft: "--od-color-coral-soft";
        readonly amberSoft: "--od-color-amber-soft";
        readonly shadow: "--od-shadow";
    };
    readonly radius: {
        readonly sm: "--od-radius-sm";
        readonly md: "--od-radius-md";
        readonly lg: "--od-radius-lg";
    };
    readonly space: {
        readonly xs: "--od-space-xs";
        readonly sm: "--od-space-sm";
        readonly md: "--od-space-md";
        readonly lg: "--od-space-lg";
        readonly xl: "--od-space-xl";
    };
    readonly font: {
        readonly body: "--od-font-body";
        readonly display: "--od-font-display";
        readonly mono: "--od-font-mono";
    };
};
export { AutoGrowTextarea, type AutoGrowTextareaProps, } from "./components/AutoGrowTextarea.js";
export { ApplicationNavigation, ApplicationNavigationGroup, ApplicationShell, ApplicationSidebar, ApplicationTopbar, type ApplicationNavigationGroupProps, type ApplicationNavigationProps, type ApplicationShellProps, type ApplicationSidebarProps, type ApplicationTopbarProps, } from "./components/ApplicationShell.js";
export { Button, type ButtonProps, type ButtonVariant, } from "./components/Button.js";
export { AccountMenu, type AccountMenuProps, } from "./components/AccountMenu.js";
export { AgentSidebar, type AgentSidebarProps, } from "./components/AgentSidebar.js";
export { AttentionRow, type AttentionRowProps, type AttentionTone, } from "./components/AttentionRow.js";
export { CalendarBoard, type CalendarBoardProps, type CalendarEvent, type CalendarEventState, type CalendarMode, } from "./components/CalendarBoard.js";
export { Card, type CardProps } from "./components/Card.js";
export { ChainStep, type ChainStepProps } from "./components/ChainStep.js";
export { ContextItem, type ContextItemProps, } from "./components/ContextItem.js";
export { HealthBar, type HealthBarProps } from "./components/HealthBar.js";
export { IconButton, type IconButtonProps } from "./components/IconButton.js";
export { NavigationItem, type NavigationItemProps, } from "./components/NavigationItem.js";
export { NavigationLink, type NavigationLinkProps, } from "./components/NavigationLink.js";
export { MobileNavigation, type MobileNavigationItem, type MobileNavigationProps, } from "./components/MobileNavigation.js";
export { PageHeading, type PageHeadingProps, } from "./components/PageHeading.js";
export { Panel, PanelHeader, type PanelHeaderProps, type PanelProps, } from "./components/Panel.js";
export { PlanCardShell, type PlanCardShellProps, } from "./components/PlanCardShell.js";
export { ReviewPlanCard, type ReviewPlanCardProps, type ReviewPlanDetail, type ReviewPlanState, } from "./components/ReviewPlanCard.js";
export { ShellErrorBoundary, type ShellErrorBoundaryProps, } from "./components/ShellErrorBoundary.js";
export { SessionCard, SessionPage, type SessionCardProps, type SessionPageProps, } from "./components/SessionPage.js";
export { StatCard, type StatCardProps } from "./components/StatCard.js";
export { StatePanel, type StatePanelKind, type StatePanelProps, } from "./components/StatePanel.js";
export { StatusDot, type StatusDotProps, type StatusTone, } from "./components/StatusDot.js";
export { StatusPill, type StatusPillProps } from "./components/StatusPill.js";
export { Toast, type ToastProps } from "./components/Toast.js";
export { WorkspaceSelector, type WorkspaceSelectorProps, } from "./components/WorkspaceSelector.js";
//# sourceMappingURL=index.d.ts.map