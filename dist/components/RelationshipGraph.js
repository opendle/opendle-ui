import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, use, useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef, } from "react";
import { assertRelationshipGraphModel, relationshipGraphKeyboardTarget, relationshipGraphPath, relationshipGraphSearch, } from "../RelationshipGraphModel.js";
import { GraphToolbar, GraphViewportContent, useInspectorReachability, } from "./GraphWorkspace.js";
import { PageSurfaceEdgeContext } from "../PageSurfaceContext.js";
import { CapabilityTag } from "./CapabilityTag.js";
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
function hasInspectorContent(value) {
    return value !== null && value !== undefined && typeof value !== "boolean";
}
function updateRelationshipGraphState(state, update) {
    const next = { ...state, ...update };
    const edgeLayoutsAreEqual = state.edgeLayouts.length === next.edgeLayouts.length &&
        state.edgeLayouts.every((edge, index) => {
            const nextEdge = next.edgeLayouts[index];
            if (nextEdge === undefined)
                return false;
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
const nodeStateLabels = {
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
function isRelationshipGraphGroup(item) {
    return "rows" in item;
}
function flattenRelationshipGraphColumn(column) {
    const flattened = [];
    for (const item of column.nodes) {
        if (!isRelationshipGraphGroup(item)) {
            flattened.push({ kind: "node", node: item, order: flattened.length });
            continue;
        }
        flattened.push({ kind: "group", node: item, order: flattened.length });
        for (const row of [...item.rows, ...(item.relatedRows ?? [])]) {
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
function searchValue(node) {
    return [node.label, ...(node.searchText ?? [])].join(" ");
}
function nodeAccessibleName(node, column, connectedLabels, group) {
    const state = node.state ?? "default";
    const stateLabel = node.stateLabel ?? nodeStateLabels[state];
    const relationship = connectedLabels.length
        ? `Connected to ${connectedLabels.join(", ")}.`
        : "No connected items.";
    const groupLabel = group ? ` Nested in ${group.label}.` : "";
    const tags = node.tags
        ?.map((tag) => tag.description ??
        (tag.direction ? `${tag.direction} ${tag.label}` : tag.label))
        .join(". ");
    return `${node.label}. ${column.label} column.${groupLabel} ${stateLabel}. ${relationship}${tags ? ` ${tags}.` : ""}`;
}
function RelationshipGraphNodeControl({ activeNodeId, activeNodeIds, column, connectedRelationships, directMatchIds, group, kind, node, onActivate, onFocusChange, onHoverChange, onKeyDown, onRegister, preferredTabStop, searchContextLabel, searchIsActive, selectedId, related = false, }) {
    const connectedLabels = connectedRelationships.map(({ label }) => label);
    const state = node.state ?? "default";
    const stateLabel = node.stateLabel ?? nodeStateLabels[state];
    const active = activeNodeIds.has(node.id);
    const dimmed = activeNodeId !== null && !active;
    const directSearchMatch = directMatchIds.has(node.id);
    const searchContext = searchIsActive && !directSearchMatch;
    const hasInteractiveTags = node.tags?.some((tag) => tag.onClick) ?? false;
    const tags = node.tags?.length ? (_jsx("span", { className: "od-relationship-graph-node-tags", children: node.tags.map((tag) => (_jsx(CapabilityTag, { ...tag }, `${tag.direction ?? ""}-${tag.label}`))) })) : null;
    const control = (_jsxs("button", { "aria-label": nodeAccessibleName(node, column, connectedLabels, group), "aria-pressed": selectedId === node.id, className: "od-relationship-graph-node", "data-active": active, "data-dimmed": dimmed, "data-group-id": group?.id, "data-node-id": node.id, "data-node-kind": kind, "data-related": related, "data-search-context": searchContext, "data-search-match": directSearchMatch, "data-selected": selectedId === node.id, "data-state": state, onBlur: () => {
            onFocusChange(null);
        }, onClick: (event) => {
            onActivate(node.id, event.currentTarget);
        }, onFocus: () => {
            onFocusChange(node.id);
        }, onKeyDown: (event) => {
            onKeyDown(event, node.id);
        }, onMouseEnter: () => {
            onHoverChange(node.id);
        }, onMouseLeave: () => {
            onHoverChange(null);
        }, ref: (element) => {
            onRegister(node.id, element);
        }, tabIndex: preferredTabStop === node.id ? 0 : -1, type: "button", children: [_jsxs("span", { className: "od-relationship-graph-node-heading", children: [_jsxs("span", { className: "od-relationship-graph-node-name", children: [related ? (_jsx("svg", { "aria-hidden": "true", className: "od-relationship-graph-related-row-icon", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M3 2v5a3 3 0 0 0 3 3h7M10 7l3 3-3 3" }) })) : null, _jsx("strong", { children: node.label }), node.inlineDetail ? (_jsx("span", { className: "od-relationship-graph-node-detail", children: node.inlineDetail })) : null] }), hasInteractiveTags ? null : tags, state !== "default" || node.stateLabel !== undefined ? (_jsx("span", { className: "od-relationship-graph-node-state", children: stateLabel })) : null] }), searchContext ? (_jsx("span", { className: "od-relationship-graph-node-context", children: searchContextLabel })) : null, node.detail ? (_jsx("span", { className: "od-relationship-graph-node-detail", children: node.detail })) : null, node.content ? (_jsx("span", { className: "od-relationship-graph-node-content", children: node.content })) : null, connectedRelationships.length > 0 ? (_jsx("span", { className: "od-relationship-graph-node-relationships", children: connectedRelationships.map(({ id, label }) => (_jsx("span", { children: label }, id))) })) : null] }));
    return node.actions === undefined && !hasInteractiveTags ? (control) : (_jsxs("div", { className: "od-relationship-graph-node-item", "data-interactive-tags": hasInteractiveTags, "data-has-actions": node.actions !== undefined, "data-selected": selectedId === node.id, "data-state": state, children: [control, hasInteractiveTags ? tags : null, node.actions === undefined ? null : (_jsx("div", { className: "od-relationship-graph-node-actions", children: node.actions }))] }));
}
function RelationshipGraphGroupSummary({ directMatchIds, group, searchContextLabel, searchIsActive, }) {
    const state = group.state ?? "default";
    const stateLabel = group.stateLabel ?? nodeStateLabels[state];
    const directSearchMatch = directMatchIds.has(group.id);
    const searchContext = searchIsActive && !directSearchMatch;
    return (_jsxs("div", { className: "od-relationship-graph-node od-relationship-graph-group-summary", "data-group-header-id": group.id, "data-node-kind": "group", "data-search-context": searchContext, "data-search-match": directSearchMatch, "data-state": state, children: [_jsxs("span", { className: "od-relationship-graph-node-heading", children: [_jsx("strong", { children: group.label }), state !== "default" || group.stateLabel !== undefined ? (_jsx("span", { className: "od-relationship-graph-node-state", children: stateLabel })) : null] }), searchContext ? (_jsx("span", { className: "od-relationship-graph-node-context", children: searchContextLabel })) : null, group.detail ? (_jsx("span", { className: "od-relationship-graph-node-detail", children: group.detail })) : null, group.content ? (_jsx("span", { className: "od-relationship-graph-node-content", children: group.content })) : null] }));
}
function editableTarget(target) {
    return (target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable));
}
function assertRelationshipGraphColumns(columns) {
    if (columns.length !== 3) {
        throw new Error("A relationship graph must have exactly three columns.");
    }
    const identifiers = new Set();
    for (const column of columns) {
        if (!column.id.trim()) {
            throw new Error("A relationship graph column must have an identifier.");
        }
        if (identifiers.has(column.id)) {
            throw new Error(`Relationship graph column identifiers must be unique: ${column.id}.`);
        }
        identifiers.add(column.id);
        if (!column.label.trim()) {
            throw new Error(`Relationship graph column ${column.id} must have a label.`);
        }
        if (column.partialResult?.label !== undefined &&
            !column.partialResult.label.trim()) {
            throw new Error(`Relationship graph column ${column.id} must have a non-empty partial-result label.`);
        }
        for (const node of column.nodes) {
            if (isRelationshipGraphGroup(node) &&
                node.headerActionable !== undefined &&
                typeof node.headerActionable !== "boolean") {
                throw new Error(`Relationship graph group ${node.id} has an invalid actionable-header state.`);
            }
            if (isRelationshipGraphGroup(node) && !node.rowsLabel.trim()) {
                throw new Error(`Relationship graph group ${node.id} must have a rows label.`);
            }
            if (isRelationshipGraphGroup(node) &&
                node.relatedRows !== undefined &&
                !node.relatedRowsLabel?.trim()) {
                throw new Error(`Relationship graph group ${node.id} must have a related-rows label.`);
            }
            const controls = isRelationshipGraphGroup(node)
                ? [node, ...node.rows, ...(node.relatedRows ?? [])]
                : [node];
            for (const control of controls) {
                const state = control.state ?? "default";
                if (!Object.hasOwn(nodeStateLabels, state)) {
                    throw new Error(`Relationship graph node ${control.id} has an invalid state.`);
                }
                if (!control.label.trim()) {
                    throw new Error(`Relationship graph node ${control.id} must have a label.`);
                }
                if (control.stateLabel !== undefined && !control.stateLabel.trim()) {
                    throw new Error(`Relationship graph node ${control.id} must have a non-empty state label.`);
                }
            }
        }
    }
}
function assertRelationshipGraphLabels(ariaLabel, searchLabel, clearSearchLabel, searchContextLabel, relationships) {
    if (!ariaLabel.trim()) {
        throw new Error("A relationship graph must have an accessible name.");
    }
    if (!searchLabel.trim()) {
        throw new Error("Relationship graph search must have an accessible name.");
    }
    if (!clearSearchLabel.trim()) {
        throw new Error("The relationship graph clear-search action must have an accessible name.");
    }
    if (!searchContextLabel.trim()) {
        throw new Error("The relationship graph search-context label must have an accessible name.");
    }
    for (const relationship of relationships) {
        if (relationship.label !== undefined && !relationship.label.trim()) {
            throw new Error(`Relationship graph relationship ${relationship.id} must have a non-empty label.`);
        }
        if (relationship.accessibleLabel !== undefined &&
            !relationship.accessibleLabel.trim()) {
            throw new Error(`Relationship graph relationship ${relationship.id} must have a non-empty accessible label.`);
        }
        if (relationship.invalidLabel !== undefined &&
            !relationship.invalidLabel.trim()) {
            throw new Error(`Relationship graph relationship ${relationship.id} must have a non-empty invalid label.`);
        }
    }
}
/** A host-neutral, responsive relationship graph with three named columns. */
// react-doctor-disable-next-line react-doctor/no-giant-component -- This coordinator keeps measurement, controlled selection, search, and one keyboard model synchronized. Render-only behavior stays in the host-neutral data model.
export function RelationshipGraph({ columns, relationships, selectedNodeId, defaultSelectedNodeId = null, onSelectionChange, onNodeActivate, auxiliaryInspector, inspector, fullPage = false, compact = false, filterToSelection = false, viewportLabel, viewportContent, searchLabel = "Search graph", searchPlaceholder = "Search all columns", searchQuery, defaultSearchQuery = "", onSearchQueryChange, toolbar, emptyState, invalidState, noResultsTitle = "No matching items", noResultsDescription = "Change the search or restore the complete graph.", clearSearchLabel = "Clear search", partialNoResultsTitle = "No matching loaded items", partialNoResultsDescription = "Load more items or change the search to continue.", searchContextLabel = "Context", className, "aria-label": ariaLabel, ...props }) {
    const [state, updateState] = useReducer(updateRelationshipGraphState, {
        announcement: "",
        edgeLayouts: [],
        focusedNodeId: null,
        hoveredNodeId: null,
        internalQuery: defaultSearchQuery,
        internalSelection: defaultSelectedNodeId,
    });
    const { announcement, edgeLayouts, focusedNodeId, hoveredNodeId, internalQuery, internalSelection, } = state;
    const searchInputRef = useRef(null);
    const clearSearchRef = useRef(null);
    const columnHeadingPrefix = useId();
    const searchInputId = useId();
    const edgeToEdge = use(PageSurfaceEdgeContext);
    const rootRef = useRef(null);
    const selectedControlRef = useRef(null);
    const boardRef = useRef(null);
    const nodeRefs = useRef(new Map());
    const partialResultRefs = useRef(new Map());
    const previousNodesByIdRef = useRef(new Map());
    const reportedMissingSelectionRef = useRef(null);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const selectedId = selectedNodeId === undefined ? internalSelection : selectedNodeId;
    const query = searchQuery ?? internalQuery;
    const orderedColumns = useMemo(() => {
        if (!filterToSelection || query.trim() || selectedId === null)
            return columns;
        return columns.map((column) => {
            const selectedGroup = column.nodes.find((node) => node.id === selectedId ||
                (isRelationshipGraphGroup(node) &&
                    [...node.rows, ...(node.relatedRows ?? [])].some((row) => row.id === selectedId)));
            if (!selectedGroup)
                return column;
            return {
                ...column,
                nodes: [
                    selectedGroup,
                    ...column.nodes.filter((node) => node !== selectedGroup),
                ],
            };
        });
    }, [columns, filterToSelection, query, selectedId]);
    const modelNodes = useMemo(() => orderedColumns.flatMap((column, columnIndex) => flattenRelationshipGraphColumn(column).map(({ group, kind, node, order }) => ({
        actionable: kind !== "group" ||
            (isRelationshipGraphGroup(node) &&
                node.headerActionable !== false),
        columnIndex,
        id: node.id,
        kind,
        order,
        ...(group ? { parentId: group.id } : {}),
        ...(node.pathSourceId !== undefined
            ? { pathSourceId: node.pathSourceId }
            : {}),
        searchValue: searchValue(node),
    }))), [orderedColumns]);
    const modelRelationships = useMemo(() => relationships.map(({ id, sourceId, targetId }) => ({
        id,
        sourceId,
        targetId,
    })), [relationships]);
    const nodesById = useMemo(() => {
        assertRelationshipGraphColumns(columns);
        assertRelationshipGraphModel(modelNodes, modelRelationships);
        assertRelationshipGraphLabels(ariaLabel, searchLabel, clearSearchLabel, searchContextLabel, relationships);
        return new Map(orderedColumns.flatMap((column) => flattenRelationshipGraphColumn(column).map(({ group, node }) => [node.id, { column, ...(group ? { group } : {}), node }])));
    }, [
        ariaLabel,
        clearSearchLabel,
        columns,
        modelNodes,
        modelRelationships,
        orderedColumns,
        relationships,
        searchContextLabel,
        searchLabel,
    ]);
    const searchResult = useMemo(() => {
        const result = relationshipGraphSearch(query, modelNodes, modelRelationships);
        const selected = modelNodes.find((node) => node.id === selectedId);
        if (!filterToSelection || query.trim() || !selected)
            return result;
        const path = relationshipGraphPath(selectedId, modelNodes, modelRelationships);
        return {
            ...result,
            visibleNodeIds: new Set(modelNodes.flatMap((node) => node.columnIndex === selected.columnIndex || path.nodeIds.has(node.id)
                ? [node.id]
                : [])),
        };
    }, [filterToSelection, modelNodes, modelRelationships, query, selectedId]);
    const visibleModelNodes = useMemo(() => modelNodes.filter((node) => searchResult.visibleNodeIds.has(node.id)), [modelNodes, searchResult.visibleNodeIds]);
    const visibleActionableModelNodes = useMemo(() => visibleModelNodes.filter((node) => node.actionable !== false), [visibleModelNodes]);
    const actionableNodeIds = useMemo(() => {
        const ids = new Set();
        for (const node of modelNodes) {
            if (node.actionable !== false)
                ids.add(node.id);
        }
        return ids;
    }, [modelNodes]);
    const visibleNodeIds = searchResult.visibleNodeIds;
    const selectedVisibleId = selectedId !== null &&
        actionableNodeIds.has(selectedId) &&
        visibleNodeIds.has(selectedId)
        ? selectedId
        : null;
    const visibleFocusedNodeId = focusedNodeId !== null &&
        actionableNodeIds.has(focusedNodeId) &&
        visibleNodeIds.has(focusedNodeId)
        ? focusedNodeId
        : null;
    const visibleHoveredNodeId = hoveredNodeId !== null &&
        actionableNodeIds.has(hoveredNodeId) &&
        visibleNodeIds.has(hoveredNodeId)
        ? hoveredNodeId
        : null;
    const activeNodeId = visibleHoveredNodeId ?? visibleFocusedNodeId ?? selectedVisibleId;
    const activePath = useMemo(() => relationshipGraphPath(activeNodeId, modelNodes, modelRelationships), [activeNodeId, modelNodes, modelRelationships]);
    const selectedPath = useMemo(() => relationshipGraphPath(selectedVisibleId, modelNodes, modelRelationships), [modelNodes, modelRelationships, selectedVisibleId]);
    const preferredTabStop = selectedVisibleId ?? visibleActionableModelNodes[0]?.id ?? null;
    const graphIsEmpty = modelNodes.length === 0;
    const noSearchResults = !graphIsEmpty && query.trim().length > 0 && visibleModelNodes.length === 0;
    const hasPartialResults = columns.some((column) => column.partialResult !== undefined);
    const partialNoSearchResults = noSearchResults && hasPartialResults;
    const visibleKey = useMemo(() => visibleModelNodes.map((node) => node.id).join("\u0000"), [visibleModelNodes]);
    const relationshipsById = useMemo(() => new Map(relationships.map((item) => [item.id, item])), [relationships]);
    const connectedLabelsById = useMemo(() => {
        const labels = new Map();
        const add = (id, relationshipId, label) => {
            const values = labels.get(id);
            const value = { id: relationshipId, label };
            if (values)
                values.push(value);
            else
                labels.set(id, [value]);
        };
        for (const relationship of relationships) {
            const source = nodesById.get(relationship.sourceId);
            const target = nodesById.get(relationship.targetId);
            if (!source || !target)
                continue;
            const relationshipLabel = relationship.accessibleLabel ??
                (relationship.invalid
                    ? (relationship.invalidLabel ?? "invalid relationship")
                    : (relationship.label ?? "relationship"));
            add(relationship.sourceId, relationship.id, relationship.accessibleLabel
                ? relationshipLabel
                : `${target.node.label} by ${relationshipLabel}`);
            add(relationship.targetId, relationship.id, relationship.accessibleLabel
                ? relationshipLabel
                : `${source.node.label} by ${relationshipLabel}`);
        }
        for (const { node } of nodesById.values()) {
            if (node.pathSourceId === undefined)
                continue;
            const routeLabels = new Map();
            for (const { node: sourceRow, group } of nodesById.values()) {
                if (group?.id !== node.pathSourceId || sourceRow.pathSourceId)
                    continue;
                for (const value of labels.get(sourceRow.id) ?? []) {
                    routeLabels.set(value.id, value);
                }
            }
            labels.set(node.id, [...routeLabels.values()]);
        }
        return labels;
    }, [nodesById, relationships]);
    const selectedNodeInspector = selectedId !== null && actionableNodeIds.has(selectedId) ? inspector : null;
    const hasAuxiliaryInspector = hasInspectorContent(auxiliaryInspector);
    if (hasAuxiliaryInspector && hasInspectorContent(selectedNodeInspector)) {
        throw new Error("A relationship graph can show one auxiliary or selected-node inspector, not both.");
    }
    const activeInspector = hasAuxiliaryInspector
        ? auxiliaryInspector
        : selectedNodeInspector;
    useLayoutEffect(() => {
        selectedControlRef.current =
            selectedId === null ? null : (nodeRefs.current.get(selectedId) ?? null);
    }, [selectedId, visibleKey]);
    useInspectorReachability(rootRef, selectedControlRef, hasInspectorContent(activeInspector));
    useEffect(() => {
        onSelectionChangeRef.current = onSelectionChange;
    }, [onSelectionChange]);
    useEffect(() => {
        const handleSlash = (event) => {
            if (event.defaultPrevented ||
                event.key !== "/" ||
                editableTarget(event.target)) {
                return;
            }
            const root = rootRef.current;
            if (!root)
                return;
            const activeGraph = document.activeElement instanceof Element
                ? document.activeElement.closest(".od-relationship-graph")
                : null;
            const shortcutOwner = activeGraph ?? document.querySelector(".od-relationship-graph");
            if (shortcutOwner !== root)
                return;
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
        if (reportedMissingSelectionRef.current === selectedId)
            return;
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
            if (document.activeElement === searchInputRef.current)
                return;
            const firstNode = nodeRefs.current.get(visibleActionableModelNodes[0]?.id ?? "");
            const emptyAction = rootRef.current?.querySelector(".od-relationship-graph-empty button, .od-relationship-graph-empty [href], .od-relationship-graph-column-actions button, .od-relationship-graph-column-actions [href]");
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
        const focusIsHidden = focusedNodeId !== null &&
            (!actionableNodeIds.has(focusedNodeId) ||
                !visibleNodeIds.has(focusedNodeId));
        const hoverIsHidden = hoveredNodeId !== null &&
            (!actionableNodeIds.has(hoveredNodeId) ||
                !visibleNodeIds.has(hoveredNodeId));
        if (!focusIsHidden && !hoverIsHidden)
            return;
        updateState({
            focusedNodeId: focusIsHidden ? null : focusedNodeId,
            hoveredNodeId: hoverIsHidden ? null : hoveredNodeId,
        });
        if (!focusIsHidden)
            return;
        if (document.activeElement === searchInputRef.current)
            return;
        const selectedNode = selectedId !== null &&
            actionableNodeIds.has(selectedId) &&
            visibleNodeIds.has(selectedId)
            ? nodeRefs.current.get(selectedId)
            : undefined;
        const firstDirectMatch = visibleActionableModelNodes.find((node) => searchResult.directMatchIds.has(node.id));
        const directMatchNode = nodeRefs.current.get(firstDirectMatch?.id ?? "");
        const firstNode = nodeRefs.current.get(visibleActionableModelNodes[0]?.id ?? "");
        const emptyAction = rootRef.current?.querySelector(".od-relationship-graph-empty button, .od-relationship-graph-empty [href], .od-relationship-graph-invalid button, .od-relationship-graph-invalid [href], .od-relationship-graph-column-actions button, .od-relationship-graph-column-actions [href]");
        (selectedNode ??
            directMatchNode ??
            firstNode ??
            emptyAction ??
            searchInputRef.current)?.focus({
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
    useEffect(() => {
        updateState({
            announcement: query.trim()
                ? searchResult.directMatchIds.size > 0
                    ? `${String(searchResult.directMatchIds.size)} matching items.`
                    : partialNoSearchResults
                        ? partialNoResultsTitle
                        : noResultsTitle
                : "",
        });
    }, [
        query,
        searchResult.directMatchIds.size,
        partialNoSearchResults,
        partialNoResultsTitle,
        noResultsTitle,
    ]);
    useLayoutEffect(() => {
        const board = boardRef.current;
        if (!board ||
            invalidState !== undefined ||
            graphIsEmpty ||
            noSearchResults) {
            updateState({ edgeLayouts: [] });
            return;
        }
        let frame = null;
        const measure = () => {
            frame = null;
            const boardBounds = board.getBoundingClientRect();
            const next = [];
            for (const relationship of relationships) {
                if (!searchResult.visibleNodeIds.has(relationship.sourceId) ||
                    !searchResult.visibleNodeIds.has(relationship.targetId)) {
                    continue;
                }
                const source = nodeRefs.current.get(relationship.sourceId);
                const target = nodeRefs.current.get(relationship.targetId);
                if (!source || !target)
                    continue;
                const sourceBounds = source.getBoundingClientRect();
                const targetBounds = target.getBoundingClientRect();
                const horizontal = targetBounds.left >= sourceBounds.right - 1;
                if (horizontal) {
                    const x1 = sourceBounds.right - boardBounds.left;
                    const y1 = sourceBounds.top + sourceBounds.height / 2 - boardBounds.top;
                    const x2 = targetBounds.left - boardBounds.left;
                    const y2 = targetBounds.top + targetBounds.height / 2 - boardBounds.top;
                    const bend = Math.max(24, (x2 - x1) / 2);
                    next.push({
                        id: relationship.id,
                        path: `M ${String(x1)} ${String(y1)} C ${String(x1 + bend)} ${String(y1)}, ${String(x2 - bend)} ${String(y2)}, ${String(x2)} ${String(y2)}`,
                    });
                }
                else {
                    const x1 = sourceBounds.left + sourceBounds.width / 2 - boardBounds.left;
                    const y1 = sourceBounds.bottom - boardBounds.top;
                    const x2 = targetBounds.left + targetBounds.width / 2 - boardBounds.left;
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
            if (frame !== null)
                cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };
        const observer = new ResizeObserver(requestMeasure);
        observer.observe(board);
        for (const header of board.querySelectorAll(".od-relationship-graph-column-header")) {
            observer.observe(header);
        }
        for (const node of nodeRefs.current.values())
            observer.observe(node);
        requestMeasure();
        return () => {
            if (frame !== null)
                cancelAnimationFrame(frame);
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
    const changeQuery = useCallback((nextQuery) => {
        if (searchQuery === undefined)
            updateState({ internalQuery: nextQuery });
        onSearchQueryChange?.(nextQuery);
    }, [onSearchQueryChange, searchQuery]);
    function selectNode(id) {
        if (selectedNodeId === undefined)
            updateState({ internalSelection: id });
        onSelectionChange?.(id);
    }
    function activateNode(id, trigger) {
        const context = nodesById.get(id);
        if (!context)
            return;
        selectNode(id);
        onNodeActivate?.({ ...context, trigger });
    }
    function handleNodeKeyDown(event, id) {
        const targetId = relationshipGraphKeyboardTarget(id, event.key, visibleModelNodes, modelRelationships);
        if (targetId === null)
            return;
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
        onFocusChange: (id) => {
            updateState({ focusedNodeId: id });
        },
        onHoverChange: (id) => {
            updateState({ hoveredNodeId: id });
        },
        onKeyDown: handleNodeKeyDown,
        onRegister: (id, element) => {
            if (element)
                nodeRefs.current.set(id, element);
            else
                nodeRefs.current.delete(id);
        },
        preferredTabStop,
        searchContextLabel,
        searchIsActive: query.trim().length > 0,
        selectedId,
    };
    const searchControls = useMemo(() => (_jsxs("div", { className: "od-relationship-graph-search", children: [_jsxs("span", { className: "od-relationship-graph-search-field", children: [_jsx("label", { htmlFor: searchInputId, children: searchLabel }), _jsxs("span", { className: "od-relationship-graph-search-control", children: [_jsx("input", { "aria-label": searchLabel, id: searchInputId, onChange: (event) => {
                                    changeQuery(event.currentTarget.value);
                                }, placeholder: searchPlaceholder, ref: searchInputRef, type: "search", value: query }), _jsx("kbd", { "aria-hidden": "true", children: "/" })] })] }), filterToSelection && selectedId !== null && !query.trim() ? (_jsx("button", { type: "button", onClick: () => {
                    if (selectedNodeId === undefined)
                        updateState({ internalSelection: null });
                    onSelectionChange?.(null);
                }, children: "Show all" })) : null, query ? (_jsx("button", { onClick: () => {
                    changeQuery("");
                    searchInputRef.current?.focus({ preventScroll: true });
                }, ref: clearSearchRef, type: "button", children: clearSearchLabel })) : null] })), [
        changeQuery,
        clearSearchLabel,
        query,
        searchInputId,
        searchLabel,
        searchPlaceholder,
        filterToSelection,
        selectedId,
        selectedNodeId,
        onSelectionChange,
    ]);
    return (_jsxs("section", { ...props, "aria-label": ariaLabel, className: classes("od-relationship-graph", className), "data-edge-to-edge": edgeToEdge, "data-full-page": fullPage, "data-compact": compact, ref: rootRef, children: [_jsx("output", { "aria-live": "polite", className: "od-visually-hidden", children: announcement }), toolbar === undefined ? (searchControls) : (_jsx(GraphToolbar, { actions: toolbar.actions, center: searchControls, className: "od-relationship-graph-toolbar", leading: toolbar.leading })), _jsxs("section", { "aria-label": viewportLabel ?? `${ariaLabel} viewport`, className: "od-relationship-graph-viewport", onPointerDown: (event) => {
                    const target = event.target;
                    if (!(target instanceof Element) ||
                        target.closest("button, a, input, select, textarea, summary, label, [role='button'], [role='link'], [contenteditable='true'], [data-node-id], [data-group-header-id]")) {
                        return;
                    }
                    updateState({ focusedNodeId: null, hoveredNodeId: null });
                    if (selectedId !== null)
                        selectNode(null);
                }, children: [_jsx(GraphViewportContent, { children: viewportContent }), invalidState !== undefined ? (_jsx("div", { className: "od-relationship-graph-invalid", role: "alert", children: invalidState })) : (_jsxs("div", { className: "od-relationship-graph-board", ref: boardRef, children: [graphIsEmpty ? (_jsx("div", { "aria-live": "polite", className: "od-relationship-graph-empty", children: emptyState ?? "No items are available." })) : noSearchResults ? (_jsxs("div", { "aria-live": "polite", className: "od-relationship-graph-empty", children: [_jsx("strong", { children: partialNoSearchResults
                                            ? partialNoResultsTitle
                                            : noResultsTitle }), _jsx("div", { children: partialNoSearchResults
                                            ? partialNoResultsDescription
                                            : noResultsDescription }), _jsx("button", { onClick: () => {
                                            changeQuery("");
                                            searchInputRef.current?.focus({ preventScroll: true });
                                        }, type: "button", children: clearSearchLabel })] })) : null, _jsx("svg", { "aria-hidden": "true", className: "od-relationship-graph-connectors", height: "100%", width: "100%", children: edgeLayouts.map((layout) => {
                                    const relationship = relationshipsById.get(layout.id);
                                    if (!relationship ||
                                        !searchResult.visibleNodeIds.has(relationship.sourceId) ||
                                        !searchResult.visibleNodeIds.has(relationship.targetId)) {
                                        return null;
                                    }
                                    return (_jsx("path", { className: "od-relationship-graph-connector", d: layout.path, "data-active": activePath.relationshipIds.has(layout.id), "data-dimmed": activeNodeId !== null &&
                                            !activePath.relationshipIds.has(layout.id), "data-invalid": relationship.invalid ?? false, "data-relationship-id": layout.id, "data-source-node-id": relationship.sourceId, "data-selected": selectedPath.relationshipIds.has(layout.id), "data-target-node-id": relationship.targetId }, layout.id));
                                }) }), orderedColumns.map((column, columnIndex) => {
                                const visibleNodes = flattenRelationshipGraphColumn(column).filter(({ node }) => searchResult.visibleNodeIds.has(node.id));
                                const visibleItems = column.nodes.filter((item) => searchResult.visibleNodeIds.has(item.id));
                                return (_jsxs("section", { "aria-labelledby": `${columnHeadingPrefix}-${String(columnIndex)}`, className: "od-relationship-graph-column", "data-column-id": column.id, "data-column-index": columnIndex, children: [_jsxs("header", { className: "od-relationship-graph-column-header", children: [_jsxs("div", { children: [_jsx("h2", { id: `${columnHeadingPrefix}-${String(columnIndex)}`, children: column.label }), _jsx("span", { children: column.countLabel ?? String(visibleNodes.length) })] }), column.actions || column.partialResult ? (_jsxs("div", { className: "od-relationship-graph-column-actions", children: [column.actions, column.partialResult ? (_jsxs("div", { className: "od-relationship-graph-partial-result", "data-partial-result": "true", ref: (element) => {
                                                                if (element) {
                                                                    partialResultRefs.current.set(column.id, element);
                                                                }
                                                                else {
                                                                    partialResultRefs.current.delete(column.id);
                                                                }
                                                            }, children: [_jsx("span", { className: "od-relationship-graph-partial-result-label", children: column.partialResult.label ?? "Partial" }), column.partialResult.action] })) : null] })) : null] }), _jsxs("div", { className: "od-relationship-graph-nodes", children: [visibleNodes.length === 0 ? (_jsx("div", { className: "od-relationship-graph-column-empty", children: column.emptyState ?? "No items in this column." })) : null, visibleItems.map((item, itemIndex) => {
                                                    if (!isRelationshipGraphGroup(item)) {
                                                        return (_jsx(RelationshipGraphNodeControl, { ...nodeControlSharedProps, column: column, connectedRelationships: connectedLabelsById.get(item.id) ?? [], kind: "node", node: item }, item.id));
                                                    }
                                                    const visibleRows = item.rows.filter((row) => searchResult.visibleNodeIds.has(row.id));
                                                    const visibleRelatedRows = item.relatedRows?.filter((row) => searchResult.visibleNodeIds.has(row.id));
                                                    const rowsHeadingId = `${columnHeadingPrefix}-${String(columnIndex)}-group-${String(itemIndex)}`;
                                                    return (_jsxs("fieldset", { className: "od-relationship-graph-group", "data-expanded": "true", "data-group-id": item.id, children: [_jsx("legend", { className: "od-visually-hidden", children: item.label }), item.headerActionable === false ? (_jsx(RelationshipGraphGroupSummary, { directMatchIds: searchResult.directMatchIds, group: item, searchContextLabel: searchContextLabel, searchIsActive: query.trim().length > 0 })) : (_jsx(RelationshipGraphNodeControl, { ...nodeControlSharedProps, column: column, connectedRelationships: connectedLabelsById.get(item.id) ?? [], kind: "group", node: item })), _jsxs("div", { className: "od-relationship-graph-group-body", children: [_jsxs("fieldset", { className: "od-relationship-graph-rows", children: [_jsx("legend", { className: "od-relationship-graph-group-heading", id: rowsHeadingId, children: item.rowsLabel }), visibleRows.map((row) => (_jsx(RelationshipGraphNodeControl, { ...nodeControlSharedProps, column: column, connectedRelationships: connectedLabelsById.get(row.id) ?? [], group: item, kind: "row", node: row }, row.id))), visibleRows.length === 0 ? (_jsx("div", { className: "od-relationship-graph-group-empty", children: item.rowsEmptyState ??
                                                                                    "No nested items in this group." })) : null, item.rowsActions ? (_jsx("div", { className: "od-relationship-graph-group-actions", children: item.rowsActions })) : null] }), visibleRelatedRows?.length ? (_jsxs("fieldset", { className: "od-relationship-graph-related-rows", children: [_jsx("legend", { className: "od-relationship-graph-related-rows-heading", children: item.relatedRowsLabel }), visibleRelatedRows.map((row) => (_jsx(RelationshipGraphNodeControl, { ...nodeControlSharedProps, column: column, connectedRelationships: connectedLabelsById.get(row.id) ?? [], group: item, kind: "row", node: row, related: true }, row.id)))] })) : null] })] }, item.id));
                                                })] })] }, column.id));
                            })] }))] }), activeInspector] }));
}
//# sourceMappingURL=RelationshipGraph.js.map