import type { ButtonHTMLAttributes, DialogHTMLAttributes, HTMLAttributes, RefObject, ReactNode, SVGAttributes } from "react";
export interface GraphWorkspaceProps extends HTMLAttributes<HTMLElement> {
    readonly toolbar?: ReactNode;
    readonly inspector?: ReactNode;
}
/** A full-width graph surface with floating controls and an optional inspector. */
export declare function GraphWorkspace({ toolbar, inspector, children, className, ...props }: GraphWorkspaceProps): import("react").JSX.Element;
export interface GraphToolbarProps extends HTMLAttributes<HTMLElement> {
    readonly leading?: ReactNode;
    readonly center?: ReactNode;
    readonly actions?: ReactNode;
}
/** Floating graph controls. Each slot accepts host-owned controls and copy. */
export declare function GraphToolbar({ leading, center, actions, className, ...props }: GraphToolbarProps): import("react").JSX.Element;
export interface GraphViewportProps extends HTMLAttributes<HTMLDivElement> {
    readonly canvasAlignment?: "start" | "center";
    readonly canvasWidth?: number | string;
    readonly canvasHeight?: number | string;
    readonly canvasClassName?: string;
    readonly canvasProps?: Omit<HTMLAttributes<HTMLDivElement>, "children">;
}
/** A scrollable viewport and a positioned canvas for nodes and edges. */
export declare function GraphViewport({ canvasAlignment, canvasWidth, canvasHeight, canvasClassName, canvasProps, children, className, ...props }: GraphViewportProps): import("react").JSX.Element;
export interface GraphEmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    readonly icon: ReactNode;
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly actions?: ReactNode;
    readonly headingLevel?: "h2" | "h3";
}
/** An accessible empty state for a graph canvas. */
export declare function GraphEmptyState({ actions, className, description, headingLevel, icon, role, title, ...props }: GraphEmptyStateProps): import("react").JSX.Element;
export type GraphNodeTone = "neutral" | "lime" | "blue" | "purple" | "coral" | "amber";
export interface GraphNodeProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "title"> {
    readonly x: number;
    readonly y: number;
    readonly title: ReactNode;
    readonly eyebrow?: ReactNode;
    readonly icon?: ReactNode;
    readonly meta?: ReactNode;
    readonly selected?: boolean;
    readonly dragging?: boolean;
    readonly dropTarget?: boolean;
    readonly root?: boolean;
    readonly tone?: GraphNodeTone;
}
/** An accessible positioned graph node. Arrow-key movement stays host-owned. */
export declare function GraphNode({ x, y, title, eyebrow, icon, meta, selected, dragging, dropTarget, root, tone, className, style, type, ...props }: GraphNodeProps): import("react").JSX.Element;
export interface GraphEdgesProps extends SVGAttributes<SVGSVGElement> {
    readonly width?: number | string;
    readonly height?: number | string;
}
/** The SVG layer below graph nodes. */
export declare function GraphEdges({ width, height, className, children, ...props }: GraphEdgesProps): import("react").JSX.Element;
interface GraphEdgeBaseProps extends Omit<SVGAttributes<SVGGElement>, "onSelect"> {
    readonly path: string;
    readonly label?: string;
    readonly labelX?: number;
    readonly labelY?: number;
    readonly selected?: boolean;
    readonly dashed?: boolean;
}
export type GraphEdgeProps = GraphEdgeBaseProps & ({
    readonly onSelect: () => void;
    readonly "aria-label": string;
} | {
    readonly onSelect?: undefined;
});
/** One visual graph connection. Supply onSelect and an aria-label for an interactive edge. */
export declare function GraphEdge({ path, label, labelX, labelY, selected, dashed, onSelect, className, onKeyDown, ...props }: GraphEdgeProps): import("react").JSX.Element;
export interface GraphInspectorProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "onClose" | "open" | "title"> {
    readonly activationKey?: string | number;
    readonly title: ReactNode;
    readonly eyebrow?: ReactNode;
    readonly icon?: ReactNode;
    readonly actions?: ReactNode;
    readonly onClose?: () => void;
    readonly closeLabel?: string;
    readonly initialFocusRef?: RefObject<HTMLElement | null>;
    readonly returnFocusRef?: RefObject<HTMLElement | null>;
    readonly tone?: GraphNodeTone;
}
/** A responsive inspector with initial focus, Escape close, and exact focus return. */
export declare function GraphInspector({ activationKey, title, eyebrow, icon, actions, onClose, closeLabel, initialFocusRef, returnFocusRef: suppliedReturnFocusRef, tone, children, className, tabIndex, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }: GraphInspectorProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=GraphWorkspace.d.ts.map