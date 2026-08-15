import type { HTMLAttributes, ReactNode, SVGAttributes, TextareaHTMLAttributes } from "react";
/** Public package version. Keep this value aligned with package.json. */
export declare const OPENDLE_UI_VERSION: "0.1.0";
export type IconName = "activity" | "arrow-up" | "audit" | "book" | "chevron" | "clock" | "cloud" | "database" | "eye" | "file" | "filter" | "grid" | "health" | "key" | "layers" | "list" | "lock" | "logout" | "menu" | "more" | "moon" | "plus" | "refresh" | "search" | "server" | "settings" | "shield" | "spark" | "users" | "warning" | "workspace";
export interface IconProps extends SVGAttributes<SVGSVGElement> {
    readonly name: IconName;
    readonly size?: number;
}
export declare function Icon({ name, size, ...props }: IconProps): import("react").JSX.Element;
export type StatusTone = "amber" | "blue" | "green" | "lime" | "red" | "slate";
export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
    readonly tone?: StatusTone;
}
export declare function StatusDot({ tone, className, ...props }: StatusDotProps): import("react").JSX.Element;
export interface StatusPillProps {
    readonly tone: StatusTone;
    readonly children: ReactNode;
    readonly className?: string;
}
export declare function StatusPill({ tone, children, className }: StatusPillProps): import("react").JSX.Element;
export interface AutoGrowTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    readonly maxHeight?: number;
}
export declare function AutoGrowTextarea({ maxHeight, onInput, rows, style, value, defaultValue, ...props }: AutoGrowTextareaProps): import("react").JSX.Element;
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
export { Button, type ButtonProps, type ButtonVariant } from "./components/Button.js";
export { Card, type CardProps } from "./components/Card.js";
export { ChainStep, type ChainStepProps } from "./components/ChainStep.js";
export { ContextItem, type ContextItemProps } from "./components/ContextItem.js";
export { IconButton, type IconButtonProps } from "./components/IconButton.js";
export { PageHeading, type PageHeadingProps } from "./components/PageHeading.js";
export { PlanCardShell, type PlanCardShellProps } from "./components/PlanCardShell.js";
export { ShellErrorBoundary, type ShellErrorBoundaryProps } from "./components/ShellErrorBoundary.js";
export { StatCard, type StatCardProps } from "./components/StatCard.js";
//# sourceMappingURL=index.d.ts.map