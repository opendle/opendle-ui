export interface GraphPoint {
    readonly x: number;
    readonly y: number;
}
export interface GraphSize {
    readonly width: number;
    readonly height: number;
}
export interface GraphRect extends GraphPoint, GraphSize {
}
export interface GraphPositionBounds {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
}
export interface GraphViewportValue extends GraphPoint {
    readonly zoom: number;
}
export interface GraphViewportLimits {
    readonly minX?: number;
    readonly maxX?: number;
    readonly minY?: number;
    readonly maxY?: number;
    readonly minZoom?: number;
    readonly maxZoom?: number;
}
export interface FitGraphViewportOptions extends GraphViewportLimits {
    readonly padding?: number;
}
/** Keep one host-owned node position inside finite declared bounds. */
export declare function clampGraphPosition(position: GraphPoint, bounds: GraphPositionBounds): GraphPoint;
/** Move one host-owned node by a deterministic delta and apply optional bounds. */
export declare function moveGraphPosition(position: GraphPoint, delta: GraphPoint, bounds?: GraphPositionBounds): GraphPoint;
/** Keep one controlled graph viewport inside finite pan and zoom limits. */
export declare function clampGraphViewport(viewport: GraphViewportValue, limits?: GraphViewportLimits): GraphViewportValue;
/** Return the graph-space point at the center of a controlled viewport. */
export declare function graphViewportCenter(viewport: GraphViewportValue, viewportSize: GraphSize, limits?: GraphViewportLimits): GraphPoint;
/** Place a new graph item around the current viewport center. */
export declare function graphPositionAtViewportCenter(viewport: GraphViewportValue, viewportSize: GraphSize, itemSize?: GraphSize, limits?: GraphViewportLimits): GraphPoint;
/** Change zoom around one screen-space anchor without moving its graph point. */
export declare function zoomGraphViewportAtPoint(viewport: GraphViewportValue, zoom: number, anchor: GraphPoint, limits?: GraphViewportLimits): GraphViewportValue;
/** Fit finite graph content inside one viewport with stable centered padding. */
export declare function fitGraphViewport(content: GraphRect, viewportSize: GraphSize, options?: FitGraphViewportOptions): GraphViewportValue;
export interface TreeLayoutItem {
    readonly id: string;
    readonly parentId: string | null;
}
export interface TreeLayoutOptions {
    readonly direction?: "horizontal" | "vertical";
    readonly nodeWidth?: number;
    readonly nodeHeight?: number;
    readonly horizontalGap?: number;
    readonly verticalGap?: number;
    readonly padding?: number;
}
export interface TreeLayoutNode {
    readonly id: string;
    readonly parentId: string | null;
    readonly x: number;
    readonly y: number;
    readonly depth: number;
}
export interface TreeLayoutEdge {
    readonly id: string;
    readonly sourceId: string;
    readonly targetId: string;
}
export interface TreeLayoutResult {
    readonly width: number;
    readonly height: number;
    readonly nodes: readonly TreeLayoutNode[];
    readonly edges: readonly TreeLayoutEdge[];
}
export interface LayeredGraphLayoutItem {
    readonly id: string;
    readonly parentIds: readonly string[];
}
export type LayeredGraphLayoutOptions = TreeLayoutOptions;
export interface LayeredGraphLayoutNode {
    readonly id: string;
    readonly parentIds: readonly string[];
    readonly x: number;
    readonly y: number;
    readonly depth: number;
}
export type LayeredGraphLayoutEdge = TreeLayoutEdge;
export interface LayeredGraphLayoutResult {
    readonly width: number;
    readonly height: number;
    readonly nodes: readonly LayeredGraphLayoutNode[];
    readonly edges: readonly LayeredGraphLayoutEdge[];
}
/** Create a stable layered layout for a directed acyclic graph. */
export declare function layoutLayeredDirectedGraph(items: readonly LayeredGraphLayoutItem[], options?: LayeredGraphLayoutOptions): LayeredGraphLayoutResult;
/** Create a stable, dependency-free layout for one or more rooted trees. */
export declare function layoutTree(items: readonly TreeLayoutItem[], options?: TreeLayoutOptions): TreeLayoutResult;
export interface TreeEdgePathOptions {
    readonly direction?: "horizontal" | "vertical";
    readonly nodeWidth?: number;
    readonly nodeHeight?: number;
}
/** Create a smooth path between two nodes from layoutTree. */
export declare function treeEdgePath(source: Pick<TreeLayoutNode, "x" | "y">, target: Pick<TreeLayoutNode, "x" | "y">, options?: TreeEdgePathOptions): string;
//# sourceMappingURL=GraphLayout.d.ts.map