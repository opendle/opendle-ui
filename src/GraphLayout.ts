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

function compareIds(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Create a stable layered layout for a directed acyclic graph. */
export function layoutLayeredDirectedGraph(
  items: readonly LayeredGraphLayoutItem[],
  options: LayeredGraphLayoutOptions = {},
): LayeredGraphLayoutResult {
  const direction = options.direction ?? "horizontal";
  const nodeWidth = options.nodeWidth ?? 176;
  const nodeHeight = options.nodeHeight ?? 72;
  const horizontalGap = options.horizontalGap ?? 64;
  const verticalGap = options.verticalGap ?? 28;
  const padding = options.padding ?? 48;
  const itemById = new Map<string, LayeredGraphLayoutItem>();

  for (const item of items) {
    if (itemById.has(item.id))
      throw new Error(`Graph item id must be unique: ${item.id}`);
    itemById.set(item.id, item);
  }

  const ids = [...itemById.keys()].sort(compareIds);
  const parentIdsById = new Map<string, string[]>();
  const knownParentsById = new Map<string, string[]>();
  const childrenById = new Map(ids.map((id) => [id, [] as string[]]));
  const remainingParents = new Map<string, number>();

  for (const id of ids) {
    const item = itemById.get(id);
    if (!item) throw new Error(`Graph item is not available: ${id}`);
    const parentIds = [...new Set(item.parentIds)].sort(compareIds);
    const knownParents = parentIds.filter((parentId) => itemById.has(parentId));
    parentIdsById.set(id, parentIds);
    knownParentsById.set(id, knownParents);
    remainingParents.set(id, knownParents.length);
    for (const parentId of knownParents) childrenById.get(parentId)?.push(id);
  }
  for (const children of childrenById.values()) children.sort(compareIds);

  let ready = ids.filter((id) => remainingParents.get(id) === 0);
  const depthById = new Map<string, number>();
  const orderedIds: string[] = [];
  while (ready.length) {
    const current = ready;
    ready = [];
    for (const id of current) {
      orderedIds.push(id);
      const parentDepth = (knownParentsById.get(id) ?? []).reduce(
        (depth, parentId) => Math.max(depth, depthById.get(parentId) ?? 0),
        -1,
      );
      depthById.set(id, parentDepth + 1);
      for (const childId of childrenById.get(id) ?? []) {
        const nextCount = (remainingParents.get(childId) ?? 0) - 1;
        remainingParents.set(childId, nextCount);
        if (nextCount === 0) ready.push(childId);
      }
    }
    ready.sort(compareIds);
  }

  if (orderedIds.length !== ids.length) {
    const cycleId = ids.find((id) => (remainingParents.get(id) ?? 0) > 0);
    throw new Error(`Graph contains a cycle at: ${cycleId ?? "unknown"}`);
  }

  const layers = new Map<number, string[]>();
  for (const id of orderedIds) {
    const depth = depthById.get(id) ?? 0;
    const layer = layers.get(depth) ?? [];
    layer.push(id);
    layers.set(depth, layer);
  }
  const maxDepth = Math.max(0, ...layers.keys());
  const maxBreadthCount = Math.max(
    1,
    ...[...layers.values()].map((layer) => layer.length),
  );
  const breadthSize = direction === "horizontal" ? nodeHeight : nodeWidth;
  const breadthGap = direction === "horizontal" ? verticalGap : horizontalGap;
  const depthSize = direction === "horizontal" ? nodeWidth : nodeHeight;
  const depthGap = direction === "horizontal" ? horizontalGap : verticalGap;
  const breadthExtent =
    padding * 2 +
    maxBreadthCount * breadthSize +
    (maxBreadthCount - 1) * breadthGap;
  const depthExtent =
    padding * 2 + (maxDepth + 1) * depthSize + maxDepth * depthGap;
  const positioned = new Map<string, LayeredGraphLayoutNode>();

  for (const [depth, layer] of layers) {
    const layerBreadth =
      layer.length * breadthSize + (layer.length - 1) * breadthGap;
    const breadthStart =
      padding + (breadthExtent - padding * 2 - layerBreadth) / 2;
    layer.forEach((id, index) => {
      const item = itemById.get(id);
      if (!item) throw new Error(`Graph item is not available: ${id}`);
      const breadth = breadthStart + index * (breadthSize + breadthGap);
      const depthPosition = padding + depth * (depthSize + depthGap);
      positioned.set(id, {
        id,
        parentIds: parentIdsById.get(id) ?? [],
        x: direction === "horizontal" ? depthPosition : breadth,
        y: direction === "horizontal" ? breadth : depthPosition,
        depth,
      });
    });
  }

  const edges = orderedIds.flatMap((targetId) =>
    (knownParentsById.get(targetId) ?? []).map((sourceId) => ({
      id: `${sourceId}:${targetId}`,
      sourceId,
      targetId,
    })),
  );
  return {
    width: direction === "horizontal" ? depthExtent : breadthExtent,
    height: direction === "horizontal" ? breadthExtent : depthExtent,
    nodes: orderedIds.map((id) => {
      const node = positioned.get(id);
      if (!node) throw new Error(`Graph item was not positioned: ${id}`);
      return node;
    }),
    edges,
  };
}

/** Create a stable, dependency-free layout for one or more rooted trees. */
export function layoutTree(
  items: readonly TreeLayoutItem[],
  options: TreeLayoutOptions = {},
): TreeLayoutResult {
  const direction = options.direction ?? "horizontal";
  const nodeWidth = options.nodeWidth ?? 176;
  const nodeHeight = options.nodeHeight ?? 72;
  const horizontalGap = options.horizontalGap ?? 64;
  const verticalGap = options.verticalGap ?? 28;
  const padding = options.padding ?? 48;
  const itemById = new Map<string, TreeLayoutItem>();
  const childrenById = new Map<string, string[]>();

  for (const item of items) {
    if (itemById.has(item.id))
      throw new Error(`Tree item id must be unique: ${item.id}`);
    itemById.set(item.id, item);
    childrenById.set(item.id, []);
  }
  for (const item of items) {
    if (item.parentId && itemById.has(item.parentId))
      childrenById.get(item.parentId)?.push(item.id);
  }

  const visitState = new Map<string, "visiting" | "complete">();
  function verifyAcyclic(id: string) {
    const state = visitState.get(id);
    if (state === "visiting")
      throw new Error(`Tree contains a cycle at: ${id}`);
    if (state === "complete") return;
    visitState.set(id, "visiting");
    for (const childId of childrenById.get(id) ?? []) verifyAcyclic(childId);
    visitState.set(id, "complete");
  }
  for (const item of items) verifyAcyclic(item.id);

  const roots = items.filter(
    (item) => !item.parentId || !itemById.has(item.parentId),
  );
  const breadthStep =
    direction === "horizontal"
      ? nodeHeight + verticalGap
      : nodeWidth + horizontalGap;
  const depthStep =
    direction === "horizontal"
      ? nodeWidth + horizontalGap
      : nodeHeight + verticalGap;
  let nextBreadth = padding;
  let maxDepth = 0;
  const positioned = new Map<string, TreeLayoutNode>();

  function place(id: string, depth: number): number {
    const childBreadths = (childrenById.get(id) ?? []).map((childId) =>
      place(childId, depth + 1),
    );
    const firstChildBreadth = childBreadths.at(0);
    const lastChildBreadth = childBreadths.at(-1);
    const breadth =
      firstChildBreadth !== undefined && lastChildBreadth !== undefined
        ? (firstChildBreadth + lastChildBreadth) / 2
        : nextBreadth;
    if (!childBreadths.length) nextBreadth += breadthStep;
    maxDepth = Math.max(maxDepth, depth);
    const item = itemById.get(id);
    if (!item) throw new Error(`Tree item is not available: ${id}`);
    positioned.set(id, {
      id,
      parentId: item.parentId,
      x: direction === "horizontal" ? padding + depth * depthStep : breadth,
      y: direction === "horizontal" ? breadth : padding + depth * depthStep,
      depth,
    });
    return breadth;
  }
  for (const root of roots) place(root.id, 0);

  const breadthExtent = Math.max(
    padding * 2 + (direction === "horizontal" ? nodeHeight : nodeWidth),
    nextBreadth -
      breadthStep +
      (direction === "horizontal" ? nodeHeight : nodeWidth) +
      padding,
  );
  const depthExtent =
    padding * 2 +
    maxDepth * depthStep +
    (direction === "horizontal" ? nodeWidth : nodeHeight);
  return {
    width: direction === "horizontal" ? depthExtent : breadthExtent,
    height: direction === "horizontal" ? breadthExtent : depthExtent,
    nodes: items.map((item) => {
      const node = positioned.get(item.id);
      if (!node) throw new Error(`Tree item was not positioned: ${item.id}`);
      return node;
    }),
    edges: items.flatMap((item) => {
      const parentId = item.parentId;
      return parentId && itemById.has(parentId)
        ? [
            {
              id: `${parentId}:${item.id}`,
              sourceId: parentId,
              targetId: item.id,
            },
          ]
        : [];
    }),
  };
}

export interface TreeEdgePathOptions {
  readonly direction?: "horizontal" | "vertical";
  readonly nodeWidth?: number;
  readonly nodeHeight?: number;
}

/** Create a smooth path between two nodes from layoutTree. */
export function treeEdgePath(
  source: Pick<TreeLayoutNode, "x" | "y">,
  target: Pick<TreeLayoutNode, "x" | "y">,
  options: TreeEdgePathOptions = {},
) {
  const direction = options.direction ?? "horizontal";
  const nodeWidth = options.nodeWidth ?? 176;
  const nodeHeight = options.nodeHeight ?? 72;
  if (direction === "vertical") {
    const startX = source.x + nodeWidth / 2;
    const startY = source.y + nodeHeight;
    const endX = target.x + nodeWidth / 2;
    const endY = target.y;
    const middleY = (startY + endY) / 2;
    return [
      "M",
      startX,
      startY,
      "C",
      startX,
      middleY,
      endX,
      middleY,
      endX,
      endY,
    ].join(" ");
  }
  const startX = source.x + nodeWidth;
  const startY = source.y + nodeHeight / 2;
  const endX = target.x;
  const endY = target.y + nodeHeight / 2;
  const middleX = (startX + endX) / 2;
  return [
    "M",
    startX,
    startY,
    "C",
    middleX,
    startY,
    middleX,
    endY,
    endX,
    endY,
  ].join(" ");
}
