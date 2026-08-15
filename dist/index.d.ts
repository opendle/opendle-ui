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
        readonly accent: "--od-color-accent";
        readonly border: "--od-color-border";
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
};
//# sourceMappingURL=index.d.ts.map