import type { HTMLAttributes, ReactNode } from "react";
export type RelationshipGraphNodeState = "default" | "disabled" | "invalid" | "unavailable";
export interface RelationshipGraphNode {
    readonly id: string;
    readonly label: string;
    readonly detail?: ReactNode;
    readonly content?: ReactNode;
    readonly searchText?: readonly string[];
    readonly state?: RelationshipGraphNodeState;
    readonly stateLabel?: string;
}
export interface RelationshipGraphColumn {
    readonly id: string;
    readonly label: string;
    readonly countLabel?: string;
    readonly actions?: ReactNode;
    readonly emptyState?: ReactNode;
    readonly nodes: readonly RelationshipGraphNode[];
}
export interface RelationshipGraphRelationship {
    readonly id: string;
    readonly sourceId: string;
    readonly targetId: string;
    readonly label?: string;
    readonly invalid?: boolean;
    readonly invalidLabel?: string;
}
export interface RelationshipGraphNodeContext {
    readonly column: RelationshipGraphColumn;
    readonly node: RelationshipGraphNode;
    readonly trigger: HTMLButtonElement;
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
    readonly inspector?: ReactNode;
    readonly searchLabel?: string;
    readonly searchPlaceholder?: string;
    readonly searchQuery?: string;
    readonly defaultSearchQuery?: string;
    readonly onSearchQueryChange?: (query: string) => void;
    readonly emptyState?: ReactNode;
    readonly invalidState?: ReactNode;
    readonly noResultsTitle?: string;
    readonly noResultsDescription?: ReactNode;
    readonly clearSearchLabel?: string;
}
/** A host-neutral, responsive relationship graph with three named columns. */
export declare function RelationshipGraph({ columns, relationships, selectedNodeId, defaultSelectedNodeId, onSelectionChange, onNodeActivate, inspector, searchLabel, searchPlaceholder, searchQuery, defaultSearchQuery, onSearchQueryChange, emptyState, invalidState, noResultsTitle, noResultsDescription, clearSearchLabel, className, "aria-label": ariaLabel, ...props }: RelationshipGraphProps): import("react").JSX.Element;
//# sourceMappingURL=RelationshipGraph.d.ts.map