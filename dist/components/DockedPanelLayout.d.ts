import { type CSSProperties, type HTMLAttributes, type ReactNode, type RefObject } from "react";
export type DockedPanelPosition = "inner" | "outer";
export interface DockedPanelDefinition {
    readonly children: ReactNode;
    readonly closeLabel?: string;
    readonly fallbackFocusRef?: RefObject<HTMLElement | null>;
    readonly onClose: () => void;
    readonly open: boolean;
    readonly openerRef?: RefObject<HTMLElement | null>;
    readonly title: string;
    readonly width?: CSSProperties["width"];
}
export interface DockedPanelLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    readonly activeSheet?: DockedPanelPosition | null;
    readonly children: ReactNode;
    readonly innerPanel?: DockedPanelDefinition;
    readonly outerPanel?: DockedPanelDefinition;
}
/**
 * A full-height workspace with two ordered end docks and one phone sheet.
 * The host owns panel state and selects the active phone sheet.
 */
export declare function DockedPanelLayout({ activeSheet, children, className, innerPanel, outerPanel, ...props }: DockedPanelLayoutProps): import("react").JSX.Element;
//# sourceMappingURL=DockedPanelLayout.d.ts.map