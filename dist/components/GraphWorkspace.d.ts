import type { ButtonHTMLAttributes, DialogHTMLAttributes, HTMLAttributes, RefObject, ReactNode, SVGAttributes } from "react";
import { type GraphPoint, type GraphPositionBounds, type GraphViewportLimits, type GraphViewportValue } from "../GraphLayout.js";
export interface GraphWorkspaceProps extends HTMLAttributes<HTMLElement> {
    readonly toolbar?: ReactNode;
    readonly inspector?: ReactNode;
    readonly selectedControlRef?: RefObject<HTMLElement | null>;
    readonly fullPage?: boolean;
}
/** A full-width graph surface with floating controls and an optional inspector. */
export declare function GraphWorkspace({ toolbar, inspector, selectedControlRef, fullPage, children, className, ...props }: GraphWorkspaceProps): import("react").JSX.Element;
export declare function useInspectorReachability(hostRef: RefObject<HTMLElement | null>, selectedControlRef: RefObject<HTMLElement | null> | undefined, active: boolean): void;
export interface GraphToolbarProps extends HTMLAttributes<HTMLElement> {
    readonly leading?: ReactNode;
    readonly center?: ReactNode;
    readonly actions?: ReactNode;
}
/** Floating graph controls. Each slot accepts host-owned controls and copy. */
export declare function GraphToolbar({ leading, center, actions, className, ...props }: GraphToolbarProps): import("react").JSX.Element;
export interface GraphViewportControlsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    readonly onZoomIn?: () => void;
    readonly onZoomOut?: () => void;
    readonly onFitView?: () => void;
    readonly onAutomaticLayout?: () => void;
    readonly zoomInLabel?: string;
    readonly zoomOutLabel?: string;
    readonly fitViewLabel?: string;
    readonly automaticLayoutLabel?: string;
    readonly zoomInDisabled?: boolean;
    readonly zoomOutDisabled?: boolean;
    readonly fitViewDisabled?: boolean;
    readonly automaticLayoutDisabled?: boolean;
}
/** Shared, labelled controls for controlled graph view and layout actions. */
export declare function GraphViewportControls({ onZoomIn, onZoomOut, onFitView, onAutomaticLayout, zoomInLabel, zoomOutLabel, fitViewLabel, automaticLayoutLabel, zoomInDisabled, zoomOutDisabled, fitViewDisabled, automaticLayoutDisabled, className, ...props }: GraphViewportControlsProps): import("react").JSX.Element;
export type GraphViewportChangeReason = "keyboard" | "pointer" | "wheel";
export interface GraphViewportProps extends HTMLAttributes<HTMLDivElement> {
    readonly canvasAlignment?: "start" | "center";
    readonly canvasWidth?: number | string;
    readonly canvasHeight?: number | string;
    readonly canvasClassName?: string;
    readonly canvasProps?: Omit<HTMLAttributes<HTMLDivElement>, "children">;
    readonly viewport?: GraphViewportValue;
    readonly viewportLimits?: GraphViewportLimits;
    readonly onViewportChange?: (viewport: GraphViewportValue, reason: GraphViewportChangeReason) => void;
    readonly panStep?: number;
    readonly zoomStep?: number;
    readonly connectionMode?: boolean;
    readonly onConnectionCancel?: () => void;
}
/** A scrollable or controlled pan-and-zoom viewport for graph content. */
export declare function GraphViewport({ canvasAlignment, canvasWidth, canvasHeight, canvasClassName, canvasProps, viewport, viewportLimits, onViewportChange, panStep, zoomStep, connectionMode, onConnectionCancel, children, className, onClick, onKeyDown, onLostPointerCapture, onPointerCancel, onPointerDown, onPointerMove, onPointerUp, onWheel, role: suppliedRole, ...props }: GraphViewportProps): import("react").JSX.Element;
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
    readonly onPositionChange?: (position: GraphPoint, reason: "keyboard" | "pointer") => void;
    readonly positionBounds?: GraphPositionBounds;
    readonly keyboardMoveStep?: number;
    readonly viewportZoom?: number;
    readonly connectionTarget?: boolean;
    readonly onConnectionTarget?: () => void;
}
/** An accessible, controlled graph node with pointer and keyboard movement. */
export declare function GraphNode({ x, y, title, eyebrow, icon, meta, selected, dragging, dropTarget, root, tone, onPositionChange, positionBounds, keyboardMoveStep, viewportZoom, connectionTarget, onConnectionTarget, className, style, type, onClick, onKeyDown, onLostPointerCapture, onPointerCancel, onPointerDown, onPointerMove, onPointerUp, ...props }: GraphNodeProps): import("react").JSX.Element;
export interface GraphNodeActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
    readonly x: number;
    readonly y: number;
    readonly viewportZoom?: number;
    readonly "aria-label": string;
}
/** A separately focusable graph action that a host can place by one node. */
export declare function GraphNodeAction({ x, y, viewportZoom, className, style, type, ...props }: GraphNodeActionProps): import("react").JSX.Element;
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
    readonly directed?: boolean;
}
export type GraphEdgeProps = GraphEdgeBaseProps & ({
    readonly onSelect: () => void;
    readonly "aria-label": string;
} | {
    readonly onSelect?: undefined;
});
/** One visual graph connection. Supply onSelect and an aria-label for an interactive edge. */
export declare function GraphEdge({ path, label, labelX, labelY, selected, dashed, directed, onSelect, className, onKeyDown, ...props }: GraphEdgeProps): import("react").JSX.Element;
export interface GraphBundledLinkProps extends Omit<SVGAttributes<SVGGElement>, "onSelect"> {
    readonly pathA: string;
    readonly pathB: string;
    readonly junctionX: number;
    readonly junctionY: number;
    readonly label: string;
    readonly endpointALabel?: string;
    readonly endpointBLabel?: string;
    readonly selected?: boolean;
    readonly onSelect: () => void;
    readonly "aria-label": string;
}
/** One selectable link junction with labelled endpoint A and B branches. */
export declare function GraphBundledLink({ pathA, pathB, junctionX, junctionY, label, endpointALabel, endpointBLabel, selected, onSelect, className, onKeyDown, ...props }: GraphBundledLinkProps): import("react").JSX.Element;
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
export declare function GraphInspector({ activationKey, title, eyebrow, icon, actions, onClose, onCancel, closeLabel, initialFocusRef, returnFocusRef: suppliedReturnFocusRef, tone, children, className, tabIndex, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }: GraphInspectorProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=GraphWorkspace.d.ts.map