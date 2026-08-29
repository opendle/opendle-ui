function normalizeSearch(value) {
    return value.trim().toLowerCase();
}
/** Check the structural rules that keep a three-column graph predictable. */
export function assertRelationshipGraphModel(nodes, relationships) {
    const nodesById = new Map();
    const ordersByColumn = [
        new Set(),
        new Set(),
        new Set(),
    ];
    for (const node of nodes) {
        if (!node.id.trim())
            throw new Error("A relationship graph node must have an identifier.");
        if (nodesById.has(node.id)) {
            throw new Error(`Relationship graph node identifiers must be unique: ${node.id}.`);
        }
        if (!Number.isInteger(node.columnIndex) ||
            node.columnIndex < 0 ||
            node.columnIndex > 2) {
            throw new Error(`Relationship graph node ${node.id} has an invalid column.`);
        }
        if (!Number.isInteger(node.order) || node.order < 0) {
            throw new Error(`Relationship graph node ${node.id} has an invalid order.`);
        }
        const columnOrders = ordersByColumn[node.columnIndex];
        if (columnOrders?.has(node.order)) {
            throw new Error(`Relationship graph node orders must be unique in each column: ${String(node.order)}.`);
        }
        columnOrders?.add(node.order);
        nodesById.set(node.id, node);
    }
    for (const node of nodes) {
        const kind = node.kind ?? "node";
        if (kind !== "group" && kind !== "node" && kind !== "row") {
            throw new Error(`Relationship graph node ${node.id} has an invalid kind.`);
        }
        if (kind === "group" && node.parentId !== undefined) {
            throw new Error(`Relationship graph group ${node.id} must not have a parent.`);
        }
        if (kind === "row" && node.parentId === undefined) {
            throw new Error(`Relationship graph row ${node.id} must name its parent group.`);
        }
        if (kind !== "row" && node.parentId !== undefined) {
            throw new Error(`Relationship graph node ${node.id} must not have a parent group.`);
        }
        if (node.actionable !== undefined && typeof node.actionable !== "boolean") {
            throw new Error(`Relationship graph node ${node.id} has an invalid actionable state.`);
        }
        if (node.parentId === undefined)
            continue;
        const parent = nodesById.get(node.parentId);
        if (parent?.kind !== "group") {
            throw new Error(`Relationship graph row ${node.id} refers to an unknown group.`);
        }
        if (parent.columnIndex !== node.columnIndex) {
            throw new Error(`Relationship graph row ${node.id} must use its parent group's column.`);
        }
    }
    const relationshipIds = new Set();
    for (const relationship of relationships) {
        if (!relationship.id.trim()) {
            throw new Error("A relationship graph relationship must have an identifier.");
        }
        if (relationshipIds.has(relationship.id)) {
            throw new Error(`Relationship graph relationship identifiers must be unique: ${relationship.id}.`);
        }
        relationshipIds.add(relationship.id);
        const source = nodesById.get(relationship.sourceId);
        const target = nodesById.get(relationship.targetId);
        if (!source || !target) {
            throw new Error(`Relationship graph relationship ${relationship.id} refers to an unknown node.`);
        }
        if (target.columnIndex - source.columnIndex !== 1) {
            throw new Error(`Relationship graph relationship ${relationship.id} must connect adjacent columns from left to right.`);
        }
        if (source.actionable === false || target.actionable === false) {
            throw new Error(`Relationship graph relationship ${relationship.id} must use actionable endpoints.`);
        }
    }
}
/** Return the complete left and right route through one graph node. */
export function relationshipGraphPath(activeId, nodes, relationships) {
    const active = activeId === null ? undefined : nodes.find((node) => node.id === activeId);
    if (!active)
        return { nodeIds: new Set(), relationshipIds: new Set() };
    const childrenByParent = new Map();
    for (const node of nodes) {
        if (node.parentId === undefined)
            continue;
        const children = childrenByParent.get(node.parentId);
        if (children)
            children.push(node.id);
        else
            childrenByParent.set(node.parentId, [node.id]);
    }
    const nodeIds = new Set([active.id]);
    const relationshipIds = new Set();
    const activeSeeds = active.kind === "group"
        ? (childrenByParent.get(active.id) ?? [active.id])
        : [active.id];
    for (const seed of activeSeeds)
        nodeIds.add(seed);
    let leftFrontier = new Set(activeSeeds);
    let rightFrontier = new Set(activeSeeds);
    for (let columnIndex = active.columnIndex; columnIndex > 0; columnIndex -= 1) {
        const next = new Set();
        for (const relationship of relationships) {
            if (!leftFrontier.has(relationship.targetId))
                continue;
            relationshipIds.add(relationship.id);
            nodeIds.add(relationship.sourceId);
            next.add(relationship.sourceId);
        }
        leftFrontier = next;
    }
    for (let columnIndex = active.columnIndex; columnIndex < 2; columnIndex += 1) {
        const next = new Set();
        for (const relationship of relationships) {
            if (!rightFrontier.has(relationship.sourceId))
                continue;
            relationshipIds.add(relationship.id);
            nodeIds.add(relationship.targetId);
            next.add(relationship.targetId);
        }
        rightFrontier = next;
    }
    for (const node of nodes) {
        if (node.parentId !== undefined && nodeIds.has(node.id)) {
            nodeIds.add(node.parentId);
        }
    }
    return { nodeIds, relationshipIds };
}
/** Keep direct search matches and the records that explain their routes. */
export function relationshipGraphSearch(query, nodes, relationships) {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) {
        return {
            directMatchIds: new Set(),
            visibleNodeIds: new Set(nodes.map((node) => node.id)),
        };
    }
    const directMatchIds = new Set(nodes
        .filter((node) => normalizeSearch(node.searchValue).includes(normalizedQuery))
        .map((node) => node.id));
    const visibleNodeIds = new Set(directMatchIds);
    const childrenByParent = new Map();
    for (const node of nodes) {
        if (node.parentId === undefined)
            continue;
        const children = childrenByParent.get(node.parentId);
        if (children)
            children.push(node.id);
        else
            childrenByParent.set(node.parentId, [node.id]);
    }
    const searchSeeds = new Set(directMatchIds);
    for (const id of directMatchIds) {
        for (const childId of childrenByParent.get(id) ?? []) {
            visibleNodeIds.add(childId);
            searchSeeds.add(childId);
        }
    }
    let leftFrontier = new Set(searchSeeds);
    let rightFrontier = new Set(searchSeeds);
    for (let distance = 0; distance < 2; distance += 1) {
        const nextLeft = new Set();
        const nextRight = new Set();
        for (const relationship of relationships) {
            if (leftFrontier.has(relationship.targetId)) {
                visibleNodeIds.add(relationship.sourceId);
                nextLeft.add(relationship.sourceId);
            }
            if (rightFrontier.has(relationship.sourceId)) {
                visibleNodeIds.add(relationship.targetId);
                nextRight.add(relationship.targetId);
            }
        }
        leftFrontier = nextLeft;
        rightFrontier = nextRight;
    }
    for (const node of nodes) {
        if (node.parentId !== undefined && visibleNodeIds.has(node.id)) {
            visibleNodeIds.add(node.parentId);
        }
    }
    return { directMatchIds, visibleNodeIds };
}
function normalizedIndex(index, columnSize) {
    return columnSize <= 1 ? 0 : index / (columnSize - 1);
}
/** Return the next node for the three-column keyboard contract. */
export function relationshipGraphKeyboardTarget(currentId, key, visibleNodes, relationships) {
    const actionableNodes = visibleNodes.filter((node) => node.actionable !== false);
    const current = actionableNodes.find((node) => node.id === currentId);
    if (!current)
        return null;
    const currentColumn = actionableNodes
        .filter((node) => node.columnIndex === current.columnIndex)
        .sort((left, right) => left.order - right.order);
    const currentIndex = currentColumn.findIndex((node) => node.id === currentId);
    if (key === "ArrowUp")
        return currentColumn[Math.max(0, currentIndex - 1)]?.id ?? null;
    if (key === "ArrowDown") {
        return (currentColumn[Math.min(currentColumn.length - 1, currentIndex + 1)]?.id ??
            null);
    }
    if (key === "Home")
        return currentColumn[0]?.id ?? null;
    if (key === "End")
        return currentColumn.at(-1)?.id ?? null;
    if (key !== "ArrowLeft" && key !== "ArrowRight")
        return null;
    const targetColumnIndex = current.columnIndex + (key === "ArrowLeft" ? -1 : 1);
    if (targetColumnIndex < 0 || targetColumnIndex > 2)
        return current.id;
    const connectedIds = new Set();
    for (const relationship of relationships) {
        if (key === "ArrowLeft" && relationship.targetId === current.id) {
            connectedIds.add(relationship.sourceId);
        }
        if (key === "ArrowRight" && relationship.sourceId === current.id) {
            connectedIds.add(relationship.targetId);
        }
    }
    const targetColumn = actionableNodes
        .filter((node) => node.columnIndex === targetColumnIndex)
        .sort((left, right) => left.order - right.order);
    const candidates = targetColumn.filter((node) => connectedIds.has(node.id));
    if (candidates.length === 0)
        return current.id;
    const currentPosition = normalizedIndex(currentIndex, currentColumn.length);
    const targetIndexes = new Map(targetColumn.map((node, index) => [node.id, index]));
    candidates.sort((left, right) => {
        const leftIndex = targetIndexes.get(left.id) ?? 0;
        const rightIndex = targetIndexes.get(right.id) ?? 0;
        const distance = Math.abs(normalizedIndex(leftIndex, targetColumn.length) - currentPosition) -
            Math.abs(normalizedIndex(rightIndex, targetColumn.length) - currentPosition);
        return distance || left.order - right.order;
    });
    return candidates[0]?.id ?? current.id;
}
//# sourceMappingURL=RelationshipGraphModel.js.map