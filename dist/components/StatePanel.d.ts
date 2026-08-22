import type { ReactNode } from "react";
import { type PanelProps } from "./Panel.js";
export type StatePanelKind = "loading" | "empty" | "error";
export interface StatePanelProps extends Omit<PanelProps, "title"> {
    readonly title: ReactNode;
    readonly kind?: StatePanelKind;
    readonly icon?: ReactNode;
    readonly actions?: ReactNode;
    readonly headingLevel?: "h2" | "h3";
    readonly retryLabel?: ReactNode;
    readonly onRetry?: () => void;
}
/** A status panel for loading, empty, and recoverable error states. */
export declare function StatePanel({ actions, children, className, headingLevel, icon, kind, onRetry, retryLabel, role, title, ...props }: StatePanelProps): import("react").JSX.Element;
//# sourceMappingURL=StatePanel.d.ts.map