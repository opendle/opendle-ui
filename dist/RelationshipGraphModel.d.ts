export interface RelationshipGraphModelNode {
    readonly id: string;
    readonly columnIndex: number;
    readonly order: number;
    readonly searchValue: string;
}
export interface RelationshipGraphModelRelationship {
    readonly id: string;
    readonly sourceId: string;
    readonly targetId: string;
}
export interface RelationshipGraphPath {
    readonly nodeIds: ReadonlySet<string>;
    readonly relationshipIds: ReadonlySet<string>;
}
/** Check the structural rules that keep a three-column graph predictable. */
export declare function assertRelationshipGraphModel(nodes: readonly RelationshipGraphModelNode[], relationships: readonly RelationshipGraphModelRelationship[]): void;
/** Return the complete left and right route through one graph node. */
export declare function relationshipGraphPath(activeId: string | null, nodes: readonly RelationshipGraphModelNode[], relationships: readonly RelationshipGraphModelRelationship[]): RelationshipGraphPath;
/** Keep direct search matches and the records that explain their routes. */
export declare function relationshipGraphSearch(query: string, nodes: readonly RelationshipGraphModelNode[], relationships: readonly RelationshipGraphModelRelationship[]): {
    directMatchIds: Set<string>;
    visibleNodeIds: Set<string>;
};
/** Return the next node for the three-column keyboard contract. */
export declare function relationshipGraphKeyboardTarget(currentId: string, key: string, visibleNodes: readonly RelationshipGraphModelNode[], relationships: readonly RelationshipGraphModelRelationship[]): string | null;
//# sourceMappingURL=RelationshipGraphModel.d.ts.map