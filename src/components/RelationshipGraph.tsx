import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import {
  assertRelationshipGraphModel,
  relationshipGraphKeyboardTarget,
  relationshipGraphPath,
  relationshipGraphSearch,
  type RelationshipGraphModelNode,
  type RelationshipGraphModelRelationship,
} from "../RelationshipGraphModel.js";
import { GraphToolbar } from "./GraphWorkspace.js";

function classes(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

function hasInspectorContent(value: ReactNode) {
  return value !== null && value !== undefined && typeof value !== "boolean";
}

export type RelationshipGraphNodeState =
  | "default"
  | "disabled"
  | "empty"
  | "enabled"
  | "error"
  | "inherited"
  | "invalid"
  | "loading"
  | "partial"
  | "ready"
  | "unavailable";

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

export type RelationshipGraphColumnItem =
  RelationshipGraphGroup | RelationshipGraphNode;

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

export interface RelationshipGraphProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly "aria-label": string;
  readonly columns: readonly [
    RelationshipGraphColumn,
    RelationshipGraphColumn,
    RelationshipGraphColumn,
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

interface RelationshipGraphEdgeLayout {
  readonly id: string;
  readonly path: string;
}

interface RelationshipGraphInternalState {
  readonly announcement: string;
  readonly edgeLayouts: readonly RelationshipGraphEdgeLayout[];
  readonly focusedNodeId: string | null;
  readonly hoveredNodeId: string | null;
  readonly internalQuery: string;
  readonly internalSelection: string | null;
}

function updateRelationshipGraphState(
  state: RelationshipGraphInternalState,
  update: Partial<RelationshipGraphInternalState>,
): RelationshipGraphInternalState {
  const next = { ...state, ...update };
  const edgeLayoutsAreEqual =
    state.edgeLayouts.length === next.edgeLayouts.length &&
    state.edgeLayouts.every((edge, index) => {
      const nextEdge = next.edgeLayouts[index];
      if (nextEdge === undefined) return false;
      return edge.id === nextEdge.id && edge.path === nextEdge.path;
    });
  return state.announcement === next.announcement &&
    edgeLayoutsAreEqual &&
    state.focusedNodeId === next.focusedNodeId &&
    state.hoveredNodeId === next.hoveredNodeId &&
    state.internalQuery === next.internalQuery &&
    state.internalSelection === next.internalSelection
    ? state
    : next;
}

const nodeStateLabels: Record<RelationshipGraphNodeState, string> = {
  default: "Available",
  disabled: "Disabled",
  empty: "Empty",
  enabled: "Enabled",
  error: "Error",
  inherited: "Inherited",
  invalid: "Invalid",
  loading: "Loading",
  partial: "Partial",
  ready: "Ready",
  unavailable: "Unavailable",
};

function isRelationshipGraphGroup(
  item: RelationshipGraphColumnItem,
): item is RelationshipGraphGroup {
  return "rows" in item;
}

interface RelationshipGraphFlatNode {
  readonly group?: RelationshipGraphGroup;
  readonly kind: "group" | "node" | "row";
  readonly node: RelationshipGraphColumnItem;
  readonly order: number;
}

function flattenRelationshipGraphColumn(column: RelationshipGraphColumn) {
  const flattened: RelationshipGraphFlatNode[] = [];
  for (const item of column.nodes) {
    if (!isRelationshipGraphGroup(item)) {
      flattened.push({ kind: "node", node: item, order: flattened.length });
      continue;
    }
    flattened.push({ kind: "group", node: item, order: flattened.length });
    for (const row of item.rows) {
      flattened.push({
        group: item,
        kind: "row",
        node: row,
        order: flattened.length,
      });
    }
  }
  return flattened;
}

function searchValue(node: RelationshipGraphNode) {
  return [node.label, ...(node.searchText ?? [])].join(" ");
}

function nodeAccessibleName(
  node: RelationshipGraphColumnItem,
  column: RelationshipGraphColumn,
  connectedLabels: readonly string[],
  group?: RelationshipGraphGroup,
) {
  const state = node.state ?? "default";
  const stateLabel = node.stateLabel ?? nodeStateLabels[state];
  const relationship = connectedLabels.length
    ? `Connected to ${connectedLabels.join(", ")}.`
    : "No connected items.";
  const groupLabel = group ? ` Nested in ${group.label}.` : "";
  return `${node.label}. ${column.label} column.${groupLabel} ${stateLabel}. ${relationship}`;
}

interface RelationshipGraphConnectedLabel {
  readonly id: string;
  readonly label: string;
}

interface RelationshipGraphNodeControlProps {
  readonly activeNodeId: string | null;
  readonly activeNodeIds: ReadonlySet<string>;
  readonly column: RelationshipGraphColumn;
  readonly connectedRelationships: readonly RelationshipGraphConnectedLabel[];
  readonly directMatchIds: ReadonlySet<string>;
  readonly group?: RelationshipGraphGroup;
  readonly kind: RelationshipGraphFlatNode["kind"];
  readonly node: RelationshipGraphColumnItem;
  readonly onActivate: (id: string, trigger: HTMLButtonElement) => void;
  readonly onFocusChange: (id: string | null) => void;
  readonly onHoverChange: (id: string | null) => void;
  readonly onKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    id: string,
  ) => void;
  readonly onRegister: (id: string, element: HTMLButtonElement | null) => void;
  readonly preferredTabStop: string | null;
  readonly searchContextLabel: string;
  readonly searchIsActive: boolean;
  readonly selectedId: string | null;
}

function RelationshipGraphNodeControl({
  activeNodeId,
  activeNodeIds,
  column,
  connectedRelationships,
  directMatchIds,
  group,
  kind,
  node,
  onActivate,
  onFocusChange,
  onHoverChange,
  onKeyDown,
  onRegister,
  preferredTabStop,
  searchContextLabel,
  searchIsActive,
  selectedId,
}: RelationshipGraphNodeControlProps) {
  const connectedLabels = connectedRelationships.map(({ label }) => label);
  const state = node.state ?? "default";
  const stateLabel = node.stateLabel ?? nodeStateLabels[state];
  const active = activeNodeIds.has(node.id);
  const dimmed = activeNodeId !== null && !active;
  const directSearchMatch = directMatchIds.has(node.id);
  const searchContext = searchIsActive && !directSearchMatch;
  return (
    <button
      aria-label={nodeAccessibleName(node, column, connectedLabels, group)}
      aria-pressed={selectedId === node.id}
      className="od-relationship-graph-node"
      data-active={active}
      data-dimmed={dimmed}
      data-group-id={group?.id}
      data-node-id={node.id}
      data-node-kind={kind}
      data-search-context={searchContext}
      data-search-match={directSearchMatch}
      data-selected={selectedId === node.id}
      data-state={state}
      onBlur={() => {
        onFocusChange(null);
      }}
      onClick={(event) => {
        onActivate(node.id, event.currentTarget);
      }}
      onFocus={() => {
        onFocusChange(node.id);
      }}
      onKeyDown={(event) => {
        onKeyDown(event, node.id);
      }}
      onMouseEnter={() => {
        onHoverChange(node.id);
      }}
      onMouseLeave={() => {
        onHoverChange(null);
      }}
      ref={(element) => {
        onRegister(node.id, element);
      }}
      tabIndex={preferredTabStop === node.id ? 0 : -1}
      type="button"
    >
      <span className="od-relationship-graph-node-heading">
        <strong>{node.label}</strong>
        {state !== "default" || node.stateLabel !== undefined ? (
          <span className="od-relationship-graph-node-state">{stateLabel}</span>
        ) : null}
      </span>
      {searchContext ? (
        <span className="od-relationship-graph-node-context">
          {searchContextLabel}
        </span>
      ) : null}
      {node.detail ? (
        <span className="od-relationship-graph-node-detail">{node.detail}</span>
      ) : null}
      {node.content ? (
        <span className="od-relationship-graph-node-content">
          {node.content}
        </span>
      ) : null}
      {connectedRelationships.length > 0 ? (
        <span className="od-relationship-graph-node-relationships">
          {connectedRelationships.map(({ id, label }) => (
            <span key={id}>{label}</span>
          ))}
        </span>
      ) : null}
    </button>
  );
}

interface RelationshipGraphGroupSummaryProps {
  readonly directMatchIds: ReadonlySet<string>;
  readonly group: RelationshipGraphGroup;
  readonly searchContextLabel: string;
  readonly searchIsActive: boolean;
}

function RelationshipGraphGroupSummary({
  directMatchIds,
  group,
  searchContextLabel,
  searchIsActive,
}: RelationshipGraphGroupSummaryProps) {
  const state = group.state ?? "default";
  const stateLabel = group.stateLabel ?? nodeStateLabels[state];
  const directSearchMatch = directMatchIds.has(group.id);
  const searchContext = searchIsActive && !directSearchMatch;
  return (
    <div
      className="od-relationship-graph-node od-relationship-graph-group-summary"
      data-group-header-id={group.id}
      data-node-kind="group"
      data-search-context={searchContext}
      data-search-match={directSearchMatch}
      data-state={state}
    >
      <span className="od-relationship-graph-node-heading">
        <strong>{group.label}</strong>
        {state !== "default" || group.stateLabel !== undefined ? (
          <span className="od-relationship-graph-node-state">{stateLabel}</span>
        ) : null}
      </span>
      {searchContext ? (
        <span className="od-relationship-graph-node-context">
          {searchContextLabel}
        </span>
      ) : null}
      {group.detail ? (
        <span className="od-relationship-graph-node-detail">
          {group.detail}
        </span>
      ) : null}
      {group.content ? (
        <span className="od-relationship-graph-node-content">
          {group.content}
        </span>
      ) : null}
    </div>
  );
}

function editableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

const relationshipGraphFocusableActionSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function assertRelationshipGraphColumns(
  columns: readonly RelationshipGraphColumn[],
) {
  if (columns.length !== 3) {
    throw new Error("A relationship graph must have exactly three columns.");
  }
  const identifiers = new Set<string>();
  for (const column of columns) {
    if (!column.id.trim()) {
      throw new Error("A relationship graph column must have an identifier.");
    }
    if (identifiers.has(column.id)) {
      throw new Error(
        `Relationship graph column identifiers must be unique: ${column.id}.`,
      );
    }
    identifiers.add(column.id);
    if (!column.label.trim()) {
      throw new Error(
        `Relationship graph column ${column.id} must have a label.`,
      );
    }
    if (
      column.partialResult?.label !== undefined &&
      !column.partialResult.label.trim()
    ) {
      throw new Error(
        `Relationship graph column ${column.id} must have a non-empty partial-result label.`,
      );
    }
    for (const node of column.nodes) {
      if (
        isRelationshipGraphGroup(node) &&
        node.headerActionable !== undefined &&
        typeof node.headerActionable !== "boolean"
      ) {
        throw new Error(
          `Relationship graph group ${node.id} has an invalid actionable-header state.`,
        );
      }
      if (isRelationshipGraphGroup(node) && !node.rowsLabel.trim()) {
        throw new Error(
          `Relationship graph group ${node.id} must have a rows label.`,
        );
      }
      const controls = isRelationshipGraphGroup(node)
        ? [node, ...node.rows]
        : [node];
      for (const control of controls) {
        const state = control.state ?? "default";
        if (!Object.hasOwn(nodeStateLabels, state)) {
          throw new Error(
            `Relationship graph node ${control.id} has an invalid state.`,
          );
        }
        if (!control.label.trim()) {
          throw new Error(
            `Relationship graph node ${control.id} must have a label.`,
          );
        }
        if (control.stateLabel !== undefined && !control.stateLabel.trim()) {
          throw new Error(
            `Relationship graph node ${control.id} must have a non-empty state label.`,
          );
        }
      }
    }
  }
}

function assertRelationshipGraphLabels(
  ariaLabel: string,
  searchLabel: string,
  clearSearchLabel: string,
  searchContextLabel: string,
  relationships: readonly RelationshipGraphRelationship[],
) {
  if (!ariaLabel.trim()) {
    throw new Error("A relationship graph must have an accessible name.");
  }
  if (!searchLabel.trim()) {
    throw new Error("Relationship graph search must have an accessible name.");
  }
  if (!clearSearchLabel.trim()) {
    throw new Error(
      "The relationship graph clear-search action must have an accessible name.",
    );
  }
  if (!searchContextLabel.trim()) {
    throw new Error(
      "The relationship graph search-context label must have an accessible name.",
    );
  }
  for (const relationship of relationships) {
    if (relationship.label !== undefined && !relationship.label.trim()) {
      throw new Error(
        `Relationship graph relationship ${relationship.id} must have a non-empty label.`,
      );
    }
    if (
      relationship.accessibleLabel !== undefined &&
      !relationship.accessibleLabel.trim()
    ) {
      throw new Error(
        `Relationship graph relationship ${relationship.id} must have a non-empty accessible label.`,
      );
    }
    if (
      relationship.invalidLabel !== undefined &&
      !relationship.invalidLabel.trim()
    ) {
      throw new Error(
        `Relationship graph relationship ${relationship.id} must have a non-empty invalid label.`,
      );
    }
  }
}

/** A host-neutral, responsive relationship graph with three named columns. */
// react-doctor-disable-next-line react-doctor/no-giant-component -- This coordinator keeps measurement, controlled selection, search, and one keyboard model synchronized. Render-only behavior stays in the host-neutral data model.
export function RelationshipGraph({
  columns,
  relationships,
  selectedNodeId,
  defaultSelectedNodeId = null,
  onSelectionChange,
  onNodeActivate,
  auxiliaryInspector,
  inspector,
  searchLabel = "Search graph",
  searchPlaceholder = "Search all columns",
  searchQuery,
  defaultSearchQuery = "",
  onSearchQueryChange,
  toolbar,
  emptyState,
  invalidState,
  noResultsTitle = "No matching items",
  noResultsDescription = "Change the search or restore the complete graph.",
  clearSearchLabel = "Clear search",
  partialNoResultsTitle = "No matching loaded items",
  partialNoResultsDescription = "Load more items or change the search to continue.",
  searchContextLabel = "Context",
  className,
  "aria-label": ariaLabel,
  ...props
}: RelationshipGraphProps) {
  const [state, updateState] = useReducer(updateRelationshipGraphState, {
    announcement: "",
    edgeLayouts: [],
    focusedNodeId: null,
    hoveredNodeId: null,
    internalQuery: defaultSearchQuery,
    internalSelection: defaultSelectedNodeId,
  });
  const {
    announcement,
    edgeLayouts,
    focusedNodeId,
    hoveredNodeId,
    internalQuery,
    internalSelection,
  } = state;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const clearSearchRef = useRef<HTMLButtonElement>(null);
  const columnHeadingPrefix = useId();
  const searchInputId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const partialResultRefs = useRef(new Map<string, HTMLDivElement>());
  const previousNodesByIdRef = useRef<
    ReadonlyMap<
      string,
      {
        readonly column: RelationshipGraphColumn;
        readonly group?: RelationshipGraphGroup;
        readonly node: RelationshipGraphColumnItem;
      }
    >
  >(new Map());
  const reportedMissingSelectionRef = useRef<string | null>(null);
  const previousQueryRef = useRef("");
  const searchOriginSelectionRef = useRef<string | null>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const selectedId =
    selectedNodeId === undefined ? internalSelection : selectedNodeId;
  const query = searchQuery ?? internalQuery;

  const modelNodes = useMemo<readonly RelationshipGraphModelNode[]>(
    () =>
      columns.flatMap((column, columnIndex) =>
        flattenRelationshipGraphColumn(column).map(
          ({ group, kind, node, order }) => ({
            actionable:
              kind !== "group" ||
              (isRelationshipGraphGroup(node) &&
                node.headerActionable !== false),
            columnIndex,
            id: node.id,
            kind,
            order,
            ...(group ? { parentId: group.id } : {}),
            searchValue: searchValue(node),
          }),
        ),
      ),
    [columns],
  );
  const modelRelationships = useMemo<
    readonly RelationshipGraphModelRelationship[]
  >(
    () =>
      relationships.map(({ id, sourceId, targetId }) => ({
        id,
        sourceId,
        targetId,
      })),
    [relationships],
  );
  const nodesById = useMemo(() => {
    assertRelationshipGraphColumns(columns);
    assertRelationshipGraphModel(modelNodes, modelRelationships);
    assertRelationshipGraphLabels(
      ariaLabel,
      searchLabel,
      clearSearchLabel,
      searchContextLabel,
      relationships,
    );
    return new Map(
      columns.flatMap((column) =>
        flattenRelationshipGraphColumn(column).map(
          ({ group, node }) =>
            [node.id, { column, ...(group ? { group } : {}), node }] as const,
        ),
      ),
    );
  }, [
    ariaLabel,
    clearSearchLabel,
    columns,
    modelNodes,
    modelRelationships,
    relationships,
    searchContextLabel,
    searchLabel,
  ]);
  const searchResult = useMemo(
    () => relationshipGraphSearch(query, modelNodes, modelRelationships),
    [modelNodes, modelRelationships, query],
  );
  const visibleModelNodes = useMemo(
    () => modelNodes.filter((node) => searchResult.visibleNodeIds.has(node.id)),
    [modelNodes, searchResult.visibleNodeIds],
  );
  const visibleActionableModelNodes = useMemo(
    () => visibleModelNodes.filter((node) => node.actionable !== false),
    [visibleModelNodes],
  );
  const actionableNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const node of modelNodes) {
      if (node.actionable !== false) ids.add(node.id);
    }
    return ids;
  }, [modelNodes]);
  const visibleNodeIds = searchResult.visibleNodeIds;
  const selectedVisibleId =
    selectedId !== null &&
    actionableNodeIds.has(selectedId) &&
    visibleNodeIds.has(selectedId)
      ? selectedId
      : null;
  const visibleFocusedNodeId =
    focusedNodeId !== null &&
    actionableNodeIds.has(focusedNodeId) &&
    visibleNodeIds.has(focusedNodeId)
      ? focusedNodeId
      : null;
  const visibleHoveredNodeId =
    hoveredNodeId !== null &&
    actionableNodeIds.has(hoveredNodeId) &&
    visibleNodeIds.has(hoveredNodeId)
      ? hoveredNodeId
      : null;
  const activeNodeId =
    visibleHoveredNodeId ?? visibleFocusedNodeId ?? selectedVisibleId;
  const activePath = useMemo(
    () => relationshipGraphPath(activeNodeId, modelNodes, modelRelationships),
    [activeNodeId, modelNodes, modelRelationships],
  );
  const selectedPath = useMemo(
    () =>
      relationshipGraphPath(selectedVisibleId, modelNodes, modelRelationships),
    [modelNodes, modelRelationships, selectedVisibleId],
  );
  const preferredTabStop =
    selectedVisibleId ?? visibleActionableModelNodes[0]?.id ?? null;
  const graphIsEmpty = modelNodes.length === 0;
  const noSearchResults =
    !graphIsEmpty && query.trim().length > 0 && visibleModelNodes.length === 0;
  const hasPartialResults = columns.some(
    (column) => column.partialResult !== undefined,
  );
  const partialNoSearchResults = noSearchResults && hasPartialResults;
  const visibleKey = useMemo(
    () => visibleModelNodes.map((node) => node.id).join("\u0000"),
    [visibleModelNodes],
  );
  const relationshipsById = useMemo(
    () => new Map(relationships.map((item) => [item.id, item] as const)),
    [relationships],
  );
  const connectedLabelsById = useMemo(() => {
    const labels = new Map<string, RelationshipGraphConnectedLabel[]>();
    const add = (id: string, relationshipId: string, label: string) => {
      const values = labels.get(id);
      const value = { id: relationshipId, label };
      if (values) values.push(value);
      else labels.set(id, [value]);
    };
    for (const relationship of relationships) {
      const source = nodesById.get(relationship.sourceId);
      const target = nodesById.get(relationship.targetId);
      if (!source || !target) continue;
      const relationshipLabel =
        relationship.accessibleLabel ??
        (relationship.invalid
          ? (relationship.invalidLabel ?? "invalid relationship")
          : (relationship.label ?? "relationship"));
      add(
        relationship.sourceId,
        relationship.id,
        relationship.accessibleLabel
          ? relationshipLabel
          : `${target.node.label} by ${relationshipLabel}`,
      );
      add(
        relationship.targetId,
        relationship.id,
        relationship.accessibleLabel
          ? relationshipLabel
          : `${source.node.label} by ${relationshipLabel}`,
      );
    }
    return labels;
  }, [nodesById, relationships]);
  const selectedNodeInspector =
    selectedId !== null && actionableNodeIds.has(selectedId) ? inspector : null;
  const hasAuxiliaryInspector = hasInspectorContent(auxiliaryInspector);
  if (hasAuxiliaryInspector && hasInspectorContent(selectedNodeInspector)) {
    throw new Error(
      "A relationship graph can show one auxiliary or selected-node inspector, not both.",
    );
  }
  const activeInspector = hasAuxiliaryInspector
    ? auxiliaryInspector
    : selectedNodeInspector;

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    const handleSlash = (event: globalThis.KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.key !== "/" ||
        editableTarget(event.target)
      ) {
        return;
      }
      const root = rootRef.current;
      if (!root) return;
      const activeGraph =
        document.activeElement instanceof Element
          ? document.activeElement.closest(".od-relationship-graph")
          : null;
      const shortcutOwner =
        activeGraph ?? document.querySelector(".od-relationship-graph");
      if (shortcutOwner !== root) return;
      event.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", handleSlash);
    return () => {
      window.removeEventListener("keydown", handleSlash);
    };
  }, []);

  useEffect(() => {
    if (selectedId === null || actionableNodeIds.has(selectedId)) {
      reportedMissingSelectionRef.current = null;
      previousNodesByIdRef.current = nodesById;
      return;
    }
    if (reportedMissingSelectionRef.current === selectedId) return;
    const previous = previousNodesByIdRef.current.get(selectedId);
    const frame = requestAnimationFrame(() => {
      reportedMissingSelectionRef.current = selectedId;
      if (selectedNodeId === undefined) {
        updateState({ internalSelection: null });
      }
      onSelectionChangeRef.current?.(null);
      updateState({
        announcement: `${previous?.node.label ?? "The selected item"} is unavailable.`,
      });
      const firstNode = nodeRefs.current.get(
        visibleActionableModelNodes[0]?.id ?? "",
      );
      const emptyAction = rootRef.current?.querySelector<HTMLElement>(
        ".od-relationship-graph-empty button, .od-relationship-graph-empty [href], .od-relationship-graph-column-actions button, .od-relationship-graph-column-actions [href]",
      );
      (firstNode ?? emptyAction ?? searchInputRef.current)?.focus({
        preventScroll: true,
      });
    });
    previousNodesByIdRef.current = nodesById;
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    actionableNodeIds,
    nodesById,
    selectedId,
    selectedNodeId,
    visibleActionableModelNodes,
  ]);

  useLayoutEffect(() => {
    const focusIsHidden =
      focusedNodeId !== null &&
      (!actionableNodeIds.has(focusedNodeId) ||
        !visibleNodeIds.has(focusedNodeId));
    const hoverIsHidden =
      hoveredNodeId !== null &&
      (!actionableNodeIds.has(hoveredNodeId) ||
        !visibleNodeIds.has(hoveredNodeId));
    if (!focusIsHidden && !hoverIsHidden) return;
    updateState({
      focusedNodeId: focusIsHidden ? null : focusedNodeId,
      hoveredNodeId: hoverIsHidden ? null : hoveredNodeId,
    });
    if (!focusIsHidden) return;
    const selectedNode =
      selectedId !== null &&
      actionableNodeIds.has(selectedId) &&
      visibleNodeIds.has(selectedId)
        ? nodeRefs.current.get(selectedId)
        : undefined;
    const firstDirectMatch = visibleActionableModelNodes.find((node) =>
      searchResult.directMatchIds.has(node.id),
    );
    const directMatchNode = nodeRefs.current.get(firstDirectMatch?.id ?? "");
    const firstNode = nodeRefs.current.get(
      visibleActionableModelNodes[0]?.id ?? "",
    );
    const emptyAction = rootRef.current?.querySelector<HTMLElement>(
      ".od-relationship-graph-empty button, .od-relationship-graph-empty [href], .od-relationship-graph-invalid button, .od-relationship-graph-invalid [href], .od-relationship-graph-column-actions button, .od-relationship-graph-column-actions [href]",
    );
    (
      selectedNode ??
      directMatchNode ??
      firstNode ??
      emptyAction ??
      searchInputRef.current
    )?.focus({
      preventScroll: true,
    });
  }, [
    actionableNodeIds,
    focusedNodeId,
    hoveredNodeId,
    searchResult.directMatchIds,
    selectedId,
    visibleKey,
    visibleActionableModelNodes,
    visibleNodeIds,
  ]);

  useLayoutEffect(() => {
    const previousQuery = previousQueryRef.current.trim();
    const currentQuery = query.trim();
    previousQueryRef.current = query;
    if (!previousQuery && currentQuery) {
      searchOriginSelectionRef.current = selectedId;
    }
    if (previousQuery && !currentQuery) {
      const restoreId = searchOriginSelectionRef.current;
      searchOriginSelectionRef.current = null;
      const targetId =
        restoreId !== null && actionableNodeIds.has(restoreId)
          ? restoreId
          : (visibleActionableModelNodes[0]?.id ?? null);
      if (targetId !== null) {
        if (selectedNodeId === undefined) {
          updateState({ internalSelection: targetId });
        }
        if (selectedId !== targetId) {
          onSelectionChangeRef.current?.(targetId);
        }
        nodeRefs.current.get(targetId)?.focus({ preventScroll: true });
      } else {
        if (selectedNodeId === undefined) {
          updateState({ internalSelection: null });
        }
        if (selectedId !== null) {
          onSelectionChangeRef.current?.(null);
        }
        searchInputRef.current?.focus({ preventScroll: true });
      }
      return;
    }
    if (
      !currentQuery ||
      (selectedId !== null &&
        actionableNodeIds.has(selectedId) &&
        visibleNodeIds.has(selectedId))
    ) {
      return;
    }
    const firstDirectMatch = visibleActionableModelNodes.find((node) =>
      searchResult.directMatchIds.has(node.id),
    );
    const firstSearchTarget =
      firstDirectMatch ?? visibleActionableModelNodes[0];
    if (searchResult.directMatchIds.size > 0 && firstSearchTarget) {
      if (selectedNodeId === undefined) {
        updateState({ internalSelection: firstSearchTarget.id });
      }
      onSelectionChangeRef.current?.(firstSearchTarget.id);
      updateState({
        announcement: `${String(searchResult.directMatchIds.size)} matching items.`,
      });
      const target = nodeRefs.current.get(firstSearchTarget.id);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "nearest", inline: "nearest" });
      return;
    }
    const firstPartialAction = columns
      .filter((column) => column.partialResult !== undefined)
      .map((column) => partialResultRefs.current.get(column.id))
      .find(
        (wrapper): wrapper is HTMLDivElement =>
          wrapper !== undefined &&
          wrapper.querySelector<HTMLElement>(
            relationshipGraphFocusableActionSelector,
          ) !== null,
      )
      ?.querySelector<HTMLElement>(relationshipGraphFocusableActionSelector);
    updateState({
      announcement: partialNoSearchResults
        ? partialNoResultsTitle
        : noResultsTitle,
    });
    (firstPartialAction ?? clearSearchRef.current)?.focus({
      preventScroll: true,
    });
  }, [
    actionableNodeIds,
    columns,
    noResultsTitle,
    partialNoResultsTitle,
    partialNoSearchResults,
    query,
    searchResult.directMatchIds,
    selectedId,
    selectedNodeId,
    visibleActionableModelNodes,
    visibleNodeIds,
  ]);

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (
      !board ||
      invalidState !== undefined ||
      graphIsEmpty ||
      noSearchResults
    ) {
      updateState({ edgeLayouts: [] });
      return;
    }
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const boardBounds = board.getBoundingClientRect();
      const next: RelationshipGraphEdgeLayout[] = [];
      for (const relationship of relationships) {
        if (
          !searchResult.visibleNodeIds.has(relationship.sourceId) ||
          !searchResult.visibleNodeIds.has(relationship.targetId)
        ) {
          continue;
        }
        const source = nodeRefs.current.get(relationship.sourceId);
        const target = nodeRefs.current.get(relationship.targetId);
        if (!source || !target) continue;
        const sourceBounds = source.getBoundingClientRect();
        const targetBounds = target.getBoundingClientRect();
        const horizontal = targetBounds.left >= sourceBounds.right - 1;
        if (horizontal) {
          const x1 = sourceBounds.right - boardBounds.left;
          const y1 =
            sourceBounds.top + sourceBounds.height / 2 - boardBounds.top;
          const x2 = targetBounds.left - boardBounds.left;
          const y2 =
            targetBounds.top + targetBounds.height / 2 - boardBounds.top;
          const bend = Math.max(24, (x2 - x1) / 2);
          next.push({
            id: relationship.id,
            path: `M ${String(x1)} ${String(y1)} C ${String(x1 + bend)} ${String(y1)}, ${String(x2 - bend)} ${String(y2)}, ${String(x2)} ${String(y2)}`,
          });
        } else {
          const x1 =
            sourceBounds.left + sourceBounds.width / 2 - boardBounds.left;
          const y1 = sourceBounds.bottom - boardBounds.top;
          const x2 =
            targetBounds.left + targetBounds.width / 2 - boardBounds.left;
          const y2 = targetBounds.top - boardBounds.top;
          const bend = Math.max(18, (y2 - y1) / 2);
          next.push({
            id: relationship.id,
            path: `M ${String(x1)} ${String(y1)} C ${String(x1)} ${String(y1 + bend)}, ${String(x2)} ${String(y2 - bend)}, ${String(x2)} ${String(y2)}`,
          });
        }
      }
      updateState({ edgeLayouts: next });
    };
    const requestMeasure = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(requestMeasure);
    observer.observe(board);
    for (const header of board.querySelectorAll(
      ".od-relationship-graph-column-header",
    )) {
      observer.observe(header);
    }
    for (const node of nodeRefs.current.values()) observer.observe(node);
    requestMeasure();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [
    graphIsEmpty,
    invalidState,
    noSearchResults,
    relationships,
    searchResult.visibleNodeIds,
    visibleKey,
  ]);

  const changeQuery = useCallback(
    (nextQuery: string) => {
      if (searchQuery === undefined) updateState({ internalQuery: nextQuery });
      onSearchQueryChange?.(nextQuery);
    },
    [onSearchQueryChange, searchQuery],
  );

  function selectNode(id: string) {
    if (selectedNodeId === undefined) updateState({ internalSelection: id });
    onSelectionChange?.(id);
  }

  function activateNode(id: string, trigger: HTMLButtonElement) {
    const context = nodesById.get(id);
    if (!context) return;
    selectNode(id);
    onNodeActivate?.({ ...context, trigger });
  }

  function handleNodeKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    id: string,
  ) {
    const targetId = relationshipGraphKeyboardTarget(
      id,
      event.key,
      visibleModelNodes,
      modelRelationships,
    );
    if (targetId === null) return;
    event.preventDefault();
    updateState({ hoveredNodeId: null });
    const target = nodeRefs.current.get(targetId);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  const nodeControlSharedProps = {
    activeNodeId,
    activeNodeIds: activePath.nodeIds,
    directMatchIds: searchResult.directMatchIds,
    onActivate: activateNode,
    onFocusChange: (id: string | null) => {
      updateState({ focusedNodeId: id });
    },
    onHoverChange: (id: string | null) => {
      updateState({ hoveredNodeId: id });
    },
    onKeyDown: handleNodeKeyDown,
    onRegister: (id: string, element: HTMLButtonElement | null) => {
      if (element) nodeRefs.current.set(id, element);
      else nodeRefs.current.delete(id);
    },
    preferredTabStop,
    searchContextLabel,
    searchIsActive: query.trim().length > 0,
    selectedId,
  };

  const searchControls = useMemo(
    () => (
      <div className="od-relationship-graph-search">
        <span className="od-relationship-graph-search-field">
          <label htmlFor={searchInputId}>{searchLabel}</label>
          <span className="od-relationship-graph-search-control">
            <input
              aria-label={searchLabel}
              id={searchInputId}
              onChange={(event) => {
                changeQuery(event.currentTarget.value);
              }}
              placeholder={searchPlaceholder}
              ref={searchInputRef}
              type="search"
              value={query}
            />
            <kbd aria-hidden="true">/</kbd>
          </span>
        </span>
        {query ? (
          <button
            onClick={() => {
              changeQuery("");
            }}
            ref={clearSearchRef}
            type="button"
          >
            {clearSearchLabel}
          </button>
        ) : null}
      </div>
    ),
    [
      changeQuery,
      clearSearchLabel,
      query,
      searchInputId,
      searchLabel,
      searchPlaceholder,
    ],
  );

  return (
    <section
      {...props}
      aria-label={ariaLabel}
      className={classes("od-relationship-graph", className)}
      ref={rootRef}
    >
      <output aria-live="polite" className="od-visually-hidden">
        {announcement}
      </output>
      {toolbar === undefined ? (
        searchControls
      ) : (
        <GraphToolbar
          actions={toolbar.actions}
          center={searchControls}
          className="od-relationship-graph-toolbar"
          leading={toolbar.leading}
        />
      )}
      <section
        aria-label={`${ariaLabel} viewport`}
        className="od-relationship-graph-viewport"
      >
        {invalidState !== undefined ? (
          <div className="od-relationship-graph-invalid" role="alert">
            {invalidState}
          </div>
        ) : (
          <div className="od-relationship-graph-board" ref={boardRef}>
            {graphIsEmpty ? (
              <div aria-live="polite" className="od-relationship-graph-empty">
                {emptyState ?? "No items are available."}
              </div>
            ) : noSearchResults ? (
              <div aria-live="polite" className="od-relationship-graph-empty">
                <strong>
                  {partialNoSearchResults
                    ? partialNoResultsTitle
                    : noResultsTitle}
                </strong>
                <div>
                  {partialNoSearchResults
                    ? partialNoResultsDescription
                    : noResultsDescription}
                </div>
                <button
                  onClick={() => {
                    changeQuery("");
                  }}
                  type="button"
                >
                  {clearSearchLabel}
                </button>
              </div>
            ) : null}
            <svg
              aria-hidden="true"
              className="od-relationship-graph-connectors"
              height="100%"
              width="100%"
            >
              {edgeLayouts.map((layout) => {
                const relationship = relationshipsById.get(layout.id);
                if (
                  !relationship ||
                  !searchResult.visibleNodeIds.has(relationship.sourceId) ||
                  !searchResult.visibleNodeIds.has(relationship.targetId)
                ) {
                  return null;
                }
                return (
                  <path
                    className="od-relationship-graph-connector"
                    d={layout.path}
                    data-active={activePath.relationshipIds.has(layout.id)}
                    data-dimmed={
                      activeNodeId !== null &&
                      !activePath.relationshipIds.has(layout.id)
                    }
                    data-invalid={relationship.invalid ?? false}
                    data-relationship-id={layout.id}
                    data-source-node-id={relationship.sourceId}
                    data-selected={selectedPath.relationshipIds.has(layout.id)}
                    data-target-node-id={relationship.targetId}
                    key={layout.id}
                  />
                );
              })}
            </svg>
            {columns.map((column, columnIndex) => {
              const visibleNodes = flattenRelationshipGraphColumn(
                column,
              ).filter(({ node }) => searchResult.visibleNodeIds.has(node.id));
              const visibleItems = column.nodes.filter((item) =>
                searchResult.visibleNodeIds.has(item.id),
              );
              return (
                <section
                  aria-labelledby={`${columnHeadingPrefix}-${String(columnIndex)}`}
                  className="od-relationship-graph-column"
                  data-column-id={column.id}
                  data-column-index={columnIndex}
                  key={column.id}
                >
                  <header className="od-relationship-graph-column-header">
                    <div>
                      <h2 id={`${columnHeadingPrefix}-${String(columnIndex)}`}>
                        {column.label}
                      </h2>
                      <span>
                        {column.countLabel ?? String(visibleNodes.length)}
                      </span>
                    </div>
                    {column.actions || column.partialResult ? (
                      <div className="od-relationship-graph-column-actions">
                        {column.actions}
                        {column.partialResult ? (
                          <div
                            className="od-relationship-graph-partial-result"
                            data-partial-result="true"
                            ref={(element) => {
                              if (element) {
                                partialResultRefs.current.set(
                                  column.id,
                                  element,
                                );
                              } else {
                                partialResultRefs.current.delete(column.id);
                              }
                            }}
                          >
                            <span className="od-relationship-graph-partial-result-label">
                              {column.partialResult.label ?? "Partial"}
                            </span>
                            {column.partialResult.action}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </header>
                  <div className="od-relationship-graph-nodes">
                    {visibleNodes.length === 0 ? (
                      <div className="od-relationship-graph-column-empty">
                        {column.emptyState ?? "No items in this column."}
                      </div>
                    ) : null}
                    {visibleItems.map((item, itemIndex) => {
                      if (!isRelationshipGraphGroup(item)) {
                        return (
                          <RelationshipGraphNodeControl
                            key={item.id}
                            {...nodeControlSharedProps}
                            column={column}
                            connectedRelationships={
                              connectedLabelsById.get(item.id) ?? []
                            }
                            kind="node"
                            node={item}
                          />
                        );
                      }
                      const visibleRows = item.rows.filter((row) =>
                        searchResult.visibleNodeIds.has(row.id),
                      );
                      const rowsHeadingId = `${columnHeadingPrefix}-${String(columnIndex)}-group-${String(itemIndex)}`;
                      return (
                        <fieldset
                          className="od-relationship-graph-group"
                          data-expanded="true"
                          data-group-id={item.id}
                          key={item.id}
                        >
                          <legend className="od-visually-hidden">
                            {item.label}
                          </legend>
                          {item.headerActionable === false ? (
                            <RelationshipGraphGroupSummary
                              directMatchIds={searchResult.directMatchIds}
                              group={item}
                              searchContextLabel={searchContextLabel}
                              searchIsActive={query.trim().length > 0}
                            />
                          ) : (
                            <RelationshipGraphNodeControl
                              {...nodeControlSharedProps}
                              column={column}
                              connectedRelationships={
                                connectedLabelsById.get(item.id) ?? []
                              }
                              kind="group"
                              node={item}
                            />
                          )}
                          <div className="od-relationship-graph-group-body">
                            <fieldset className="od-relationship-graph-rows">
                              <legend
                                className="od-relationship-graph-group-heading"
                                id={rowsHeadingId}
                              >
                                {item.rowsLabel}
                              </legend>
                              {visibleRows.map((row) => (
                                <RelationshipGraphNodeControl
                                  key={row.id}
                                  {...nodeControlSharedProps}
                                  column={column}
                                  connectedRelationships={
                                    connectedLabelsById.get(row.id) ?? []
                                  }
                                  group={item}
                                  kind="row"
                                  node={row}
                                />
                              ))}
                              {visibleRows.length === 0 ? (
                                <div className="od-relationship-graph-group-empty">
                                  {item.rowsEmptyState ??
                                    "No nested items in this group."}
                                </div>
                              ) : null}
                              {item.rowsActions ? (
                                <div className="od-relationship-graph-group-actions">
                                  {item.rowsActions}
                                </div>
                              ) : null}
                            </fieldset>
                          </div>
                        </fieldset>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
      {activeInspector}
    </section>
  );
}
