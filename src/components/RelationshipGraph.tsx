import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import {
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

function classes(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export type RelationshipGraphNodeState =
  "default" | "disabled" | "invalid" | "unavailable";

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
  invalid: "Invalid",
  unavailable: "Unavailable",
};

function searchValue(node: RelationshipGraphNode) {
  return [node.label, ...(node.searchText ?? [])].join(" ");
}

function nodeAccessibleName(
  node: RelationshipGraphNode,
  column: RelationshipGraphColumn,
  connectedLabels: readonly string[],
) {
  const state = node.state ?? "default";
  const stateLabel = node.stateLabel ?? nodeStateLabels[state];
  const relationship = connectedLabels.length
    ? `Connected to ${connectedLabels.join(", ")}.`
    : "No connected items.";
  return `${node.label}. ${column.label} column. ${stateLabel}. ${relationship}`;
}

function editableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function assertRelationshipGraphColumns(
  columns: RelationshipGraphProps["columns"],
) {
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
  inspector,
  searchLabel = "Search graph",
  searchPlaceholder = "Search all columns",
  searchQuery,
  defaultSearchQuery = "",
  onSearchQueryChange,
  emptyState,
  invalidState,
  noResultsTitle = "No matching items",
  noResultsDescription = "Change the search or restore the complete graph.",
  clearSearchLabel = "Clear search",
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
  const columnHeadingPrefix = useId();
  const searchInputId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const previousNodesByIdRef = useRef<
    ReadonlyMap<
      string,
      {
        readonly column: RelationshipGraphColumn;
        readonly node: RelationshipGraphNode;
      }
    >
  >(new Map());
  const reportedMissingSelectionRef = useRef<string | null>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const selectedId =
    selectedNodeId === undefined ? internalSelection : selectedNodeId;
  const query = searchQuery ?? internalQuery;

  const modelNodes = useMemo<readonly RelationshipGraphModelNode[]>(
    () =>
      columns.flatMap((column, columnIndex) =>
        column.nodes.map((node, order) => ({
          columnIndex,
          id: node.id,
          order,
          searchValue: searchValue(node),
        })),
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
  assertRelationshipGraphColumns(columns);
  assertRelationshipGraphModel(modelNodes, modelRelationships);

  const nodesById = useMemo(
    () =>
      new Map(
        columns.flatMap((column) =>
          column.nodes.map((node) => [node.id, { column, node }] as const),
        ),
      ),
    [columns],
  );
  const searchResult = useMemo(
    () => relationshipGraphSearch(query, modelNodes, modelRelationships),
    [modelNodes, modelRelationships, query],
  );
  const visibleModelNodes = useMemo(
    () => modelNodes.filter((node) => searchResult.visibleNodeIds.has(node.id)),
    [modelNodes, searchResult.visibleNodeIds],
  );
  const selectedVisibleId =
    selectedId !== null && searchResult.visibleNodeIds.has(selectedId)
      ? selectedId
      : null;
  const activeNodeId = hoveredNodeId ?? focusedNodeId ?? selectedVisibleId;
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
    selectedVisibleId ?? visibleModelNodes[0]?.id ?? null;
  const graphIsEmpty = modelNodes.length === 0;
  const noSearchResults =
    !graphIsEmpty && query.trim().length > 0 && visibleModelNodes.length === 0;
  const visibleKey = visibleModelNodes.map((node) => node.id).join("\u0000");

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
    if (selectedId === null || nodesById.has(selectedId)) {
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
      const firstNode = nodeRefs.current.get(visibleModelNodes[0]?.id ?? "");
      const emptyAction = rootRef.current?.querySelector<HTMLButtonElement>(
        ".od-relationship-graph-empty button",
      );
      (firstNode ?? emptyAction ?? searchInputRef.current)?.focus({
        preventScroll: true,
      });
    });
    previousNodesByIdRef.current = nodesById;
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [nodesById, selectedId, selectedNodeId, visibleModelNodes]);

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

  function changeQuery(nextQuery: string) {
    if (searchQuery === undefined) updateState({ internalQuery: nextQuery });
    onSearchQueryChange?.(nextQuery);
  }

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
    const target = nodeRefs.current.get(targetId);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

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
            type="button"
          >
            {clearSearchLabel}
          </button>
        ) : null}
      </div>
      <section
        aria-label={`${ariaLabel} viewport`}
        className="od-relationship-graph-viewport"
      >
        {invalidState !== undefined ? (
          <div className="od-relationship-graph-invalid" role="alert">
            {invalidState}
          </div>
        ) : graphIsEmpty ? (
          <output className="od-relationship-graph-empty">
            {emptyState ?? "No items are available."}
          </output>
        ) : noSearchResults ? (
          <output className="od-relationship-graph-empty">
            <strong>{noResultsTitle}</strong>
            <div>{noResultsDescription}</div>
            <button
              onClick={() => {
                changeQuery("");
              }}
              type="button"
            >
              {clearSearchLabel}
            </button>
          </output>
        ) : (
          <div className="od-relationship-graph-board" ref={boardRef}>
            <svg
              aria-hidden="true"
              className="od-relationship-graph-connectors"
              height="100%"
              width="100%"
            >
              {edgeLayouts.map((layout) => {
                const relationship = relationships.find(
                  (item) => item.id === layout.id,
                );
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
                    data-selected={selectedPath.relationshipIds.has(layout.id)}
                    key={layout.id}
                  />
                );
              })}
            </svg>
            {columns.map((column, columnIndex) => {
              const visibleNodes = column.nodes.filter((node) =>
                searchResult.visibleNodeIds.has(node.id),
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
                    {column.actions ? (
                      <div className="od-relationship-graph-column-actions">
                        {column.actions}
                      </div>
                    ) : null}
                  </header>
                  <div className="od-relationship-graph-nodes">
                    {visibleNodes.length === 0 ? (
                      <div className="od-relationship-graph-column-empty">
                        {column.emptyState ?? "No items in this column."}
                      </div>
                    ) : null}
                    {visibleNodes.map((node) => {
                      const connectedLabels = relationships.flatMap(
                        (relationship) => {
                          const relationshipLabel = relationship.invalid
                            ? (relationship.invalidLabel ??
                              "invalid relationship")
                            : (relationship.label ?? "relationship");
                          if (relationship.sourceId === node.id) {
                            const target = nodesById.get(relationship.targetId);
                            return target
                              ? [`${target.node.label} by ${relationshipLabel}`]
                              : [];
                          }
                          if (relationship.targetId === node.id) {
                            const source = nodesById.get(relationship.sourceId);
                            return source
                              ? [`${source.node.label} by ${relationshipLabel}`]
                              : [];
                          }
                          return [];
                        },
                      );
                      const state = node.state ?? "default";
                      const stateLabel =
                        node.stateLabel ?? nodeStateLabels[state];
                      const active = activePath.nodeIds.has(node.id);
                      const dimmed = activeNodeId !== null && !active;
                      return (
                        <button
                          aria-label={nodeAccessibleName(
                            node,
                            column,
                            connectedLabels,
                          )}
                          aria-pressed={selectedId === node.id}
                          className="od-relationship-graph-node"
                          data-active={active}
                          data-dimmed={dimmed}
                          data-node-id={node.id}
                          data-search-match={searchResult.directMatchIds.has(
                            node.id,
                          )}
                          data-selected={selectedId === node.id}
                          data-state={state}
                          key={node.id}
                          onBlur={() => {
                            updateState({ focusedNodeId: null });
                          }}
                          onClick={(event) => {
                            activateNode(node.id, event.currentTarget);
                          }}
                          onFocus={() => {
                            updateState({ focusedNodeId: node.id });
                          }}
                          onKeyDown={(event) => {
                            handleNodeKeyDown(event, node.id);
                          }}
                          onMouseEnter={() => {
                            updateState({ hoveredNodeId: node.id });
                          }}
                          onMouseLeave={() => {
                            updateState({ hoveredNodeId: null });
                          }}
                          ref={(element) => {
                            if (element) nodeRefs.current.set(node.id, element);
                            else nodeRefs.current.delete(node.id);
                          }}
                          tabIndex={preferredTabStop === node.id ? 0 : -1}
                          type="button"
                        >
                          <span className="od-relationship-graph-node-heading">
                            <strong>{node.label}</strong>
                            {state !== "default" ? (
                              <span className="od-relationship-graph-node-state">
                                {stateLabel}
                              </span>
                            ) : null}
                          </span>
                          {node.detail ? (
                            <span className="od-relationship-graph-node-detail">
                              {node.detail}
                            </span>
                          ) : null}
                          {node.content ? (
                            <span className="od-relationship-graph-node-content">
                              {node.content}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
      {inspector}
    </section>
  );
}
