import type { HTMLAttributes, ReactNode } from "react";
export type RelationshipGraphNodeState = "default" | "disabled" | "empty" | "enabled" | "error" | "inherited" | "invalid" | "loading" | "partial" | "ready" | "unavailable";
export interface RelationshipGraphNode {
    readonly id: string;
    readonly label: string;
    readonly detail?: ReactNode;
    readonly content?: ReactNode;
    readonly searchText?: readonly string[];
    readonly state?: RelationshipGraphNodeState;
    readonly stateLabel?: string;
}
/** One labelled compound card whose nested rows are controls. */
export interface RelationshipGraphGroup extends RelationshipGraphNode {
    /** Set to false when the visible header only names the nested row controls. */
    readonly headerActionable?: boolean;
    readonly rowsLabel: string;
    readonly rows: readonly RelationshipGraphNode[];
    readonly rowsActions?: ReactNode;
    readonly rowsEmptyState?: ReactNode;
}
export type RelationshipGraphColumnItem = RelationshipGraphGroup | RelationshipGraphNode;
export interface RelationshipGraphPartialResult {
    /** One host-supplied action that can load more results for this column. */
    readonly action: ReactNode;
    readonly label?: string;
}
export interface RelationshipGraphColumn {
    readonly id: string;
    readonly label: string;
    readonly countLabel?: string;
    readonly actions?: ReactNode;
    readonly emptyState?: ReactNode;
    readonly nodes: readonly RelationshipGraphColumnItem[];
    readonly partialResult?: RelationshipGraphPartialResult;
}
export interface RelationshipGraphRelationship {
    readonly id: string;
    readonly sourceId: string;
    readonly targetId: string;
    readonly label?: string;
    /** Complete host-supplied relationship text for accessible names and stacked layouts. */
    readonly accessibleLabel?: string;
    readonly invalid?: boolean;
    readonly invalidLabel?: string;
}
export interface RelationshipGraphNodeContext {
    readonly column: RelationshipGraphColumn;
    readonly group?: RelationshipGraphGroup;
    readonly node: RelationshipGraphColumnItem;
    readonly trigger: HTMLButtonElement;
}
export interface RelationshipGraphToolbarOptions {
    readonly leading?: ReactNode;
    readonly actions?: ReactNode;
}
export interface RelationshipGraphProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    readonly "aria-label": string;
    readonly columns: readonly [
        RelationshipGraphColumn,
        RelationshipGraphColumn,
        RelationshipGraphColumn
    ];
    readonly relationships: readonly RelationshipGraphRelationship[];
    readonly selectedNodeId?: string | null;
    readonly defaultSelectedNodeId?: string | null;
    readonly onSelectionChange?: (nodeId: string | null) => void;
    readonly onNodeActivate?: (context: RelationshipGraphNodeContext) => void;
    /** One host-controlled inspector that is not attached to a graph node, such as a create form. */
    readonly auxiliaryInspector?: ReactNode;
    /** The selected-node inspector. It is removed when the selected node is not in the graph. */
    readonly inspector?: ReactNode;
    readonly searchLabel?: string;
    readonly searchPlaceholder?: string;
    readonly searchQuery?: string;
    readonly defaultSearchQuery?: string;
    readonly onSearchQueryChange?: (query: string) => void;
    readonly toolbar?: RelationshipGraphToolbarOptions;
    readonly emptyState?: ReactNode;
    readonly invalidState?: ReactNode;
    readonly noResultsTitle?: string;
    readonly noResultsDescription?: ReactNode;
    readonly clearSearchLabel?: string;
    readonly partialNoResultsTitle?: string;
    readonly partialNoResultsDescription?: ReactNode;
    readonly searchContextLabel?: string;
}
/** A host-neutral, responsive relationship graph with three named columns. */
export declare function RelationshipGraph({ columns, relationships, selectedNodeId, defaultSelectedNodeId, onSelectionChange, onNodeActivate, auxiliaryInspector, inspector, searchLabel, searchPlaceholder, searchQuery, defaultSearchQuery, onSearchQueryChange, toolbar, emptyState, invalidState, noResultsTitle, noResultsDescription, clearSearchLabel, partialNoResultsTitle, partialNoResultsDescription, searchContextLabel, className, "aria-label": ariaLabel, ...props }: RelationshipGraphProps): import("react").JSX.Element;
//# sourceMappingURL=RelationshipGraph.d.ts.map