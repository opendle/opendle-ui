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