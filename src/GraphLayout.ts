export interface GraphPoint {
  readonly x: number;
  readonly y: number;
}

export interface GraphSize {
  readonly width: number;
  readonly height: number;
}

export interface GraphRect extends GraphPoint, GraphSize {}

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

function assertFiniteGraphValue(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite.`);
  }
}

function assertGraphSize(size: GraphSize, name: string) {
  assertFiniteGraphValue(size.width, `${name} width`);
  assertFiniteGraphValue(size.height, `${name} height`);
  if (size.width < 0 || size.height < 0) {
    throw new Error(`${name} dimensions must not be negative.`);
  }
}

function orderedGraphRange(
  minimum: number | undefined,
  maximum: number | undefined,
  fallbackMinimum: number,
  fallbackMaximum: number,
  name: string,
) {
  const min = minimum ?? fallbackMinimum;
  const max = maximum ?? fallbackMaximum;
  assertFiniteGraphValue(min, `${name} minimum`);
  assertFiniteGraphValue(max, `${name} maximum`);
  if (min > max)
    throw new Error(`${name} minimum must not exceed its maximum.`);
  return { min, max };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

/** Keep one host-owned node position inside finite declared bounds. */
export function clampGraphPosition(
  position: GraphPoint,
  bounds: GraphPositionBounds,
): GraphPoint {
  assertFiniteGraphValue(position.x, "Graph position x");
  assertFiniteGraphValue(position.y, "Graph position y");
  const xRange = orderedGraphRange(
    bounds.minX,
    bounds.maxX,
    bounds.minX,
    bounds.maxX,
    "Graph position x",
  );
  const yRange = orderedGraphRange(
    bounds.minY,
    bounds.maxY,
    bounds.minY,
    bounds.maxY,
    "Graph position y",
  );
  return {
    x: clamp(position.x, xRange.min, xRange.max),
    y: clamp(position.y, yRange.min, yRange.max),
  };
}

/** Move one host-owned node by a deterministic delta and apply optional bounds. */
export function moveGraphPosition(
  position: GraphPoint,
  delta: GraphPoint,
  bounds?: GraphPositionBounds,
): GraphPoint {
  assertFiniteGraphValue(position.x, "Graph position x");
  assertFiniteGraphValue(position.y, "Graph position y");
  assertFiniteGraphValue(delta.x, "Graph movement x");
  assertFiniteGraphValue(delta.y, "Graph movement y");
  const next = { x: position.x + delta.x, y: position.y + delta.y };
  assertFiniteGraphValue(next.x, "Moved graph position x");
  assertFiniteGraphValue(next.y, "Moved graph position y");
  return bounds ? clampGraphPosition(next, bounds) : next;
}

/** Keep one controlled graph viewport inside finite pan and zoom limits. */
export function clampGraphViewport(
  viewport: GraphViewportValue,
  limits: GraphViewportLimits = {},
): GraphViewportValue {
  assertFiniteGraphValue(viewport.x, "Graph viewport x");
  assertFiniteGraphValue(viewport.y, "Graph viewport y");
  assertFiniteGraphValue(viewport.zoom, "Graph viewport zoom");
  const xRange = orderedGraphRange(
    limits.minX,
    limits.maxX,
    -1_000_000,
    1_000_000,
    "Graph viewport x",
  );
  const yRange = orderedGraphRange(
    limits.minY,
    limits.maxY,
    -1_000_000,
    1_000_000,
    "Graph viewport y",
  );
  const zoomRange = orderedGraphRange(
    limits.minZoom,
    limits.maxZoom,
    0.1,
    4,
    "Graph viewport zoom",
  );
  if (zoomRange.min <= 0) {
    throw new Error("Graph viewport zoom must be greater than zero.");
  }
  return {
    x: clamp(viewport.x, xRange.min, xRange.max),
    y: clamp(viewport.y, yRange.min, yRange.max),
    zoom: clamp(viewport.zoom, zoomRange.min, zoomRange.max),
  };
}

/** Return the graph-space point at the center of a controlled viewport. */
export function graphViewportCenter(
  viewport: GraphViewportValue,
  viewportSize: GraphSize,
  limits: GraphViewportLimits = {},
): GraphPoint {
  const safeViewport = clampGraphViewport(viewport, limits);
  assertGraphSize(viewportSize, "Graph viewport");
  const center = {
    x: (viewportSize.width / 2 - safeViewport.x) / safeViewport.zoom,
    y: (viewportSize.height / 2 - safeViewport.y) / safeViewport.zoom,
  };
  assertFiniteGraphValue(center.x, "Graph viewport center x");
  assertFiniteGraphValue(center.y, "Graph viewport center y");
  return center;
}

/** Place a new graph item around the current viewport center. */
export function graphPositionAtViewportCenter(
  viewport: GraphViewportValue,
  viewportSize: GraphSize,
  itemSize: GraphSize = { width: 0, height: 0 },
  limits: GraphViewportLimits = {},
): GraphPoint {
  assertGraphSize(itemSize, "Graph item");
  const center = graphViewportCenter(viewport, viewportSize, limits);
  const position = {
    x: center.x - itemSize.width / 2,
    y: center.y - itemSize.height / 2,
  };
  assertFiniteGraphValue(position.x, "Centered graph position x");
  assertFiniteGraphValue(position.y, "Centered graph position y");
  return position;
}

function centeredZoomRange(
  contentCenter: number,
  viewportExtent: number,
  panMinimum: number,
  panMaximum: number,
) {
  const viewportCenter = viewportExtent / 2;
  if (contentCenter > 0) {
    return {
      min: (viewportCenter - panMaximum) / contentCenter,
      max: (viewportCenter - panMinimum) / contentCenter,
    };
  }
  if (contentCenter < 0) {
    return {
      min: (panMinimum - viewportCenter) / -contentCenter,
      max: (panMaximum - viewportCenter) / -contentCenter,
    };
  }
  return viewportCenter >= panMinimum && viewportCenter <= panMaximum
    ? { min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY }
    : { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY };
}

/** Change zoom around one screen-space anchor without moving its graph point. */
export function zoomGraphViewportAtPoint(
  viewport: GraphViewportValue,
  zoom: number,
  anchor: GraphPoint,
  limits: GraphViewportLimits = {},
): GraphViewportValue {
  const current = clampGraphViewport(viewport, limits);
  assertFiniteGraphValue(anchor.x, "Graph zoom anchor x");
  assertFiniteGraphValue(anchor.y, "Graph zoom anchor y");
  const nextZoom = clampGraphViewport({ ...current, zoom }, limits).zoom;
  const graphX = (anchor.x - current.x) / current.zoom;
  const graphY = (anchor.y - current.y) / current.zoom;
  return clampGraphViewport(
    {
      x: anchor.x - graphX * nextZoom,
      y: anchor.y - graphY * nextZoom,
      zoom: nextZoom,
    },
    limits,
  );
}

/** Fit finite graph content inside one viewport with stable centered padding. */
export function fitGraphViewport(
  content: GraphRect,
  viewportSize: GraphSize,
  options: FitGraphViewportOptions = {},
): GraphViewportValue {
  assertFiniteGraphValue(content.x, "Graph content x");
  assertFiniteGraphValue(content.y, "Graph content y");
  assertGraphSize(content, "Graph content");
  assertGraphSize(viewportSize, "Graph viewport");
  const padding = options.padding ?? 32;
  assertFiniteGraphValue(padding, "Graph fit padding");
  if (padding < 0) throw new Error("Graph fit padding must not be negative.");
  const availableWidth = Math.max(0, viewportSize.width - padding * 2);
  const availableHeight = Math.max(0, viewportSize.height - padding * 2);
  const widthZoom =
    content.width === 0
      ? Number.POSITIVE_INFINITY
      : availableWidth / content.width;
  const heightZoom =
    content.height === 0
      ? Number.POSITIVE_INFINITY
      : availableHeight / content.height;
  const requestedZoom = Math.min(widthZoom, heightZoom);
  const zoomRange = orderedGraphRange(
    options.minZoom,
    options.maxZoom,
    0.1,
    4,
    "Graph viewport zoom",
  );
  if (zoomRange.min <= 0) {
    throw new Error("Graph viewport zoom must be greater than zero.");
  }
  const xRange = orderedGraphRange(
    options.minX,
    options.maxX,
    -1_000_000,
    1_000_000,
    "Graph viewport x",
  );
  const yRange = orderedGraphRange(
    options.minY,
    options.maxY,
    -1_000_000,
    1_000_000,
    "Graph viewport y",
  );
  const contentCenterX = content.x + content.width / 2;
  const contentCenterY = content.y + content.height / 2;
  assertFiniteGraphValue(contentCenterX, "Graph content center x");
  assertFiniteGraphValue(contentCenterY, "Graph content center y");
  const centeredX = centeredZoomRange(
    contentCenterX,
    viewportSize.width,
    xRange.min,
    xRange.max,
  );
  const centeredY = centeredZoomRange(
    contentCenterY,
    viewportSize.height,
    yRange.min,
    yRange.max,
  );
  const centeredMinimum = Math.max(zoomRange.min, centeredX.min, centeredY.min);
  const centeredMaximum = Math.min(zoomRange.max, centeredX.max, centeredY.max);
  const sizeZoom = Number.isFinite(requestedZoom)
    ? requestedZoom
    : zoomRange.max;
  const zoom =
    centeredMinimum <= centeredMaximum
      ? clamp(sizeZoom, centeredMinimum, centeredMaximum)
      : clampGraphViewport({ x: 0, y: 0, zoom: sizeZoom }, options).zoom;
  return clampGraphViewport(
    {
      x: viewportSize.width / 2 - contentCenterX * zoom,
      y: viewportSize.height / 2 - contentCenterY * zoom,
      zoom,
    },
    options,
  );
}

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
  const direction = options.direction ?? "vertical";
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
  const direction = options.direction ?? "vertical";
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
  const direction = options.direction ?? "vertical";
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
