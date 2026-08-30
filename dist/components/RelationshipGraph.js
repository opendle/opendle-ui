import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef, } from "react";
import { assertRelationshipGraphModel, relationshipGraphKeyboardTarget, relationshipGraphPath, relationshipGraphSearch, } from "../RelationshipGraphModel.js";
import { GraphToolbar } from "./GraphWorkspace.js";
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
    return `${node.label}. ${column.label} column.${groupLabel} ${stateLabel}. ${relationship}`;
}
function RelationshipGraphNodeControl({ activeNodeId, activeNodeIds, column, connectedRelationships, directMatchIds, group, kind, node, onActivate, onFocusChange, onHoverChange, onKeyDown, onRegister, preferredTabStop, searchContextLabel, searchIsActive, selectedId, }) {
    const connectedLabels = connectedRelationships.map(({ label }) => label);
    const state = node.state ?? "default";
    const stateLabel = node.stateLabel ?? nodeStateLabels[state];
    const active = activeNodeIds.has(node.id);
    const dimmed = activeNodeId !== null && !active;
    const directSearchMatch = directMatchIds.has(node.id);
    const searchContext = searchIsActive && !directSearchMatch;
    return (_jsxs("button", { "aria-label": nodeAccessibleName(node, column, connectedLabels, group), "aria-pressed": selectedId === node.id, className: "od-relationship-graph-node", "data-active": active, "data-dimmed": dimmed, "data-group-id": group?.id, "data-node-id": node.id, "data-node-kind": kind, "data-search-context": searchContext, "data-search-match": directSearchMatch, "data-selected": selectedId === node.id, "data-state": state, onBlur: () => {
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
        }, tabIndex: preferredTabStop === node.id ? 0 : -1, type: "button", children: [_jsxs("span", { className: "od-relationship-graph-node-heading", children: [_jsx("strong", { children: node.label }), state !== "default" || node.stateLabel !== undefined ? (_jsx("span", { className: "od-relationship-graph-node-state", children: stateLabel })) : null] }), searchContext ? (_jsx("span", { className: "od-relationship-graph-node-context", children: searchContextLabel })) : null, node.detail ? (_jsx("span", { className: "od-relationship-graph-node-detail", children: node.detail })) : null, node.content ? (_jsx("span", { className: "od-relationship-graph-node-content", children: node.content })) : null, connectedRelationships.length > 0 ? (_jsx("span", { className: "od-relationship-graph-node-relationships", children: connectedRelationships.map(({ id, label }) => (_jsx("span", { children: label }, id))) })) : null] }));
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
const relationshipGraphFocusableActionSelector = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(", ");
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
            const controls = isRelationshipGraphGroup(node)
                ? [node, ...node.rows]
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
export function RelationshipGraph({ columns, relationships, selectedNodeId, defaultSelectedNodeId = null, onSelectionChange, onNodeActivate, auxiliaryInspector, inspector, searchLabel = "Search graph", searchPlaceholder = "Search all columns", searchQuery, defaultSearchQuery = "", onSearchQueryChange, toolbar, emptyState, invalidState, noResultsTitle = "No matching items", noResultsDescription = "Change the search or restore the complete graph.", clearSearchLabel = "Clear search", partialNoResultsTitle = "No matching loaded items", partialNoResultsDescription = "Load more items or change the search to continue.", searchContextLabel = "Context", className, "aria-label": ariaLabel, ...props }) {
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
    const rootRef = useRef(null);
    const boardRef = useRef(null);
    const nodeRefs = useRef(new Map());
    const partialResultRefs = useRef(new Map());
    const previousNodesByIdRef = useRef(new Map());
    const reportedMissingSelectionRef = useRef(null);
    const previousQueryRef = useRef("");
    const searchOriginSelectionRef = useRef(null);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const selectedId = selectedNodeId === undefined ? internalSelection : selectedNodeId;
    const query = searchQuery ?? internalQuery;
    const modelNodes = useMemo(() => columns.flatMap((column, columnIndex) => flattenRelationshipGraphColumn(column).map(({ group, kind, node, order }) => ({
        actionable: kind !== "group" ||
            (isRelationshipGraphGroup(node) &&
                node.headerActionable !== false),
        columnIndex,
        id: node.id,
        kind,
        order,
        ...(group ? { parentId: group.id } : {}),
        searchValue: searchValue(node),
    }))), [columns]);
    const modelRelationships = useMemo(() => relationships.map(({ id, sourceId, targetId }) => ({
        id,
        sourceId,
        targetId,
    })), [relationships]);
    const nodesById = useMemo(() => {
        assertRelationshipGraphColumns(columns);
        assertRelationshipGraphModel(modelNodes, modelRelationships);
        assertRelationshipGraphLabels(ariaLabel, searchLabel, clearSearchLabel, searchContextLabel, relationships);
        return new Map(columns.flatMap((column) => flattenRelationshipGraphColumn(column).map(({ group, node }) => [node.id, { column, ...(group ? { group } : {}), node }])));
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
    const searchResult = useMemo(() => relationshipGraphSearch(query, modelNodes, modelRelationships), [modelNodes, modelRelationships, query]);
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
            const targetId = restoreId !== null && actionableNodeIds.has(restoreId)
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
            }
            else {
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
        if (!currentQuery ||
            (selectedId !== null &&
                actionableNodeIds.has(selectedId) &&
                visibleNodeIds.has(selectedId))) {
            return;
        }
        const firstDirectMatch = visibleActionableModelNodes.find((node) => searchResult.directMatchIds.has(node.id));
        const firstSearchTarget = firstDirectMatch ?? visibleActionableModelNodes[0];
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
            .find((wrapper) => wrapper !== undefined &&
            wrapper.querySelector(relationshipGraphFocusableActionSelector) !== null)
            ?.querySelector(relationshipGraphFocusableActionSelector);
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
                                }, placeholder: searchPlaceholder, ref: searchInputRef, type: "search", value: query }), _jsx("kbd", { "aria-hidden": "true", children: "/" })] })] }), query ? (_jsx("button", { onClick: () => {
                    changeQuery("");
                }, ref: clearSearchRef, type: "button", children: clearSearchLabel })) : null] })), [
        changeQuery,
        clearSearchLabel,
        query,
        searchInputId,
        searchLabel,
        searchPlaceholder,
    ]);
    return (_jsxs("section", { ...props, "aria-label": ariaLabel, className: classes("od-relationship-graph", className), ref: rootRef, children: [_jsx("output", { "aria-live": "polite", className: "od-visually-hidden", children: announcement }), toolbar === undefined ? (searchControls) : (_jsx(GraphToolbar, { actions: toolbar.actions, center: searchControls, className: "od-relationship-graph-toolbar", leading: toolbar.leading })), _jsx("section", { "aria-label": `${ariaLabel} viewport`, className: "od-relationship-graph-viewport", children: invalidState !== undefined ? (_jsx("div", { className: "od-relationship-graph-invalid", role: "alert", children: invalidState })) : (_jsxs("div", { className: "od-relationship-graph-board", ref: boardRef, children: [graphIsEmpty ? (_jsx("div", { "aria-live": "polite", className: "od-relationship-graph-empty", children: emptyState ?? "No items are available." })) : noSearchResults ? (_jsxs("div", { "aria-live": "polite", className: "od-relationship-graph-empty", children: [_jsx("strong", { children: partialNoSearchResults
                                        ? partialNoResultsTitle
                                        : noResultsTitle }), _jsx("div", { children: partialNoSearchResults
                                        ? partialNoResultsDescription
                                        : noResultsDescription }), _jsx("button", { onClick: () => {
                                        changeQuery("");
                                    }, type: "button", children: clearSearchLabel })] })) : null, _jsx("svg", { "aria-hidden": "true", className: "od-relationship-graph-connectors", height: "100%", width: "100%", children: edgeLayouts.map((layout) => {
                                const relationship = relationshipsById.get(layout.id);
                                if (!relationship ||
                                    !searchResult.visibleNodeIds.has(relationship.sourceId) ||
                                    !searchResult.visibleNodeIds.has(relationship.targetId)) {
                                    return null;
                                }
                                return (_jsx("path", { className: "od-relationship-graph-connector", d: layout.path, "data-active": activePath.relationshipIds.has(layout.id), "data-dimmed": activeNodeId !== null &&
                                        !activePath.relationshipIds.has(layout.id), "data-invalid": relationship.invalid ?? false, "data-relationship-id": layout.id, "data-source-node-id": relationship.sourceId, "data-selected": selectedPath.relationshipIds.has(layout.id), "data-target-node-id": relationship.targetId }, layout.id));
                            }) }), columns.map((column, columnIndex) => {
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
                                                const rowsHeadingId = `${columnHeadingPrefix}-${String(columnIndex)}-group-${String(itemIndex)}`;
                                                return (_jsxs("fieldset", { className: "od-relationship-graph-group", "data-expanded": "true", "data-group-id": item.id, children: [_jsx("legend", { className: "od-visually-hidden", children: item.label }), item.headerActionable === false ? (_jsx(RelationshipGraphGroupSummary, { directMatchIds: searchResult.directMatchIds, group: item, searchContextLabel: searchContextLabel, searchIsActive: query.trim().length > 0 })) : (_jsx(RelationshipGraphNodeControl, { ...nodeControlSharedProps, column: column, connectedRelationships: connectedLabelsById.get(item.id) ?? [], kind: "group", node: item })), _jsx("div", { className: "od-relationship-graph-group-body", children: _jsxs("fieldset", { className: "od-relationship-graph-rows", children: [_jsx("legend", { className: "od-relationship-graph-group-heading", id: rowsHeadingId, children: item.rowsLabel }), visibleRows.map((row) => (_jsx(RelationshipGraphNodeControl, { ...nodeControlSharedProps, column: column, connectedRelationships: connectedLabelsById.get(row.id) ?? [], group: item, kind: "row", node: row }, row.id))), visibleRows.length === 0 ? (_jsx("div", { className: "od-relationship-graph-group-empty", children: item.rowsEmptyState ??
                                                                            "No nested items in this group." })) : null, item.rowsActions ? (_jsx("div", { className: "od-relationship-graph-group-actions", children: item.rowsActions })) : null] }) })] }, item.id));
                                            })] })] }, column.id));
                        })] })) }), activeInspector] }));
}
//# sourceMappingURL=RelationshipGraph.js.map