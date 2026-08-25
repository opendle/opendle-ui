import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef, } from "react";
import { assertRelationshipGraphModel, relationshipGraphKeyboardTarget, relationshipGraphPath, relationshipGraphSearch, } from "../RelationshipGraphModel.js";
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
    invalid: "Invalid",
    unavailable: "Unavailable",
};
function searchValue(node) {
    return [node.label, ...(node.searchText ?? [])].join(" ");
}
function nodeAccessibleName(node, column, connectedLabels) {
    const state = node.state ?? "default";
    const stateLabel = node.stateLabel ?? nodeStateLabels[state];
    const relationship = connectedLabels.length
        ? `Connected to ${connectedLabels.join(", ")}.`
        : "No connected items.";
    return `${node.label}. ${column.label} column. ${stateLabel}. ${relationship}`;
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
        for (const node of column.nodes) {
            const state = node.state ?? "default";
            if (!Object.hasOwn(nodeStateLabels, state)) {
                throw new Error(`Relationship graph node ${node.id} has an invalid state.`);
            }
            if (!node.label.trim()) {
                throw new Error(`Relationship graph node ${node.id} must have a label.`);
            }
            if (node.stateLabel !== undefined && !node.stateLabel.trim()) {
                throw new Error(`Relationship graph node ${node.id} must have a non-empty state label.`);
            }
        }
    }
}
function assertRelationshipGraphLabels(ariaLabel, searchLabel, clearSearchLabel, relationships) {
    if (!ariaLabel.trim()) {
        throw new Error("A relationship graph must have an accessible name.");
    }
    if (!searchLabel.trim()) {
        throw new Error("Relationship graph search must have an accessible name.");
    }
    if (!clearSearchLabel.trim()) {
        throw new Error("The relationship graph clear-search action must have an accessible name.");
    }
    for (const relationship of relationships) {
        if (relationship.label !== undefined && !relationship.label.trim()) {
            throw new Error(`Relationship graph relationship ${relationship.id} must have a non-empty label.`);
        }
        if (relationship.invalidLabel !== undefined &&
            !relationship.invalidLabel.trim()) {
            throw new Error(`Relationship graph relationship ${relationship.id} must have a non-empty invalid label.`);
        }
    }
}
/** A host-neutral, responsive relationship graph with three named columns. */
// react-doctor-disable-next-line react-doctor/no-giant-component -- This coordinator keeps measurement, controlled selection, search, and one keyboard model synchronized. Render-only behavior stays in the host-neutral data model.
export function RelationshipGraph({ columns, relationships, selectedNodeId, defaultSelectedNodeId = null, onSelectionChange, onNodeActivate, auxiliaryInspector, inspector, searchLabel = "Search graph", searchPlaceholder = "Search all columns", searchQuery, defaultSearchQuery = "", onSearchQueryChange, emptyState, invalidState, noResultsTitle = "No matching items", noResultsDescription = "Change the search or restore the complete graph.", clearSearchLabel = "Clear search", className, "aria-label": ariaLabel, ...props }) {
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
    const columnHeadingPrefix = useId();
    const searchInputId = useId();
    const rootRef = useRef(null);
    const boardRef = useRef(null);
    const nodeRefs = useRef(new Map());
    const previousNodesByIdRef = useRef(new Map());
    const reportedMissingSelectionRef = useRef(null);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const selectedId = selectedNodeId === undefined ? internalSelection : selectedNodeId;
    const query = searchQuery ?? internalQuery;
    const modelNodes = useMemo(() => columns.flatMap((column, columnIndex) => column.nodes.map((node, order) => ({
        columnIndex,
        id: node.id,
        order,
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
        assertRelationshipGraphLabels(ariaLabel, searchLabel, clearSearchLabel, relationships);
        return new Map(columns.flatMap((column) => column.nodes.map((node) => [node.id, { column, node }])));
    }, [
        ariaLabel,
        clearSearchLabel,
        columns,
        modelNodes,
        modelRelationships,
        relationships,
        searchLabel,
    ]);
    const searchResult = useMemo(() => relationshipGraphSearch(query, modelNodes, modelRelationships), [modelNodes, modelRelationships, query]);
    const visibleModelNodes = useMemo(() => modelNodes.filter((node) => searchResult.visibleNodeIds.has(node.id)), [modelNodes, searchResult.visibleNodeIds]);
    const visibleNodeIds = searchResult.visibleNodeIds;
    const selectedVisibleId = selectedId !== null && visibleNodeIds.has(selectedId) ? selectedId : null;
    const visibleFocusedNodeId = focusedNodeId !== null && visibleNodeIds.has(focusedNodeId)
        ? focusedNodeId
        : null;
    const visibleHoveredNodeId = hoveredNodeId !== null && visibleNodeIds.has(hoveredNodeId)
        ? hoveredNodeId
        : null;
    const activeNodeId = visibleHoveredNodeId ?? visibleFocusedNodeId ?? selectedVisibleId;
    const activePath = useMemo(() => relationshipGraphPath(activeNodeId, modelNodes, modelRelationships), [activeNodeId, modelNodes, modelRelationships]);
    const selectedPath = useMemo(() => relationshipGraphPath(selectedVisibleId, modelNodes, modelRelationships), [modelNodes, modelRelationships, selectedVisibleId]);
    const preferredTabStop = selectedVisibleId ?? visibleModelNodes[0]?.id ?? null;
    const graphIsEmpty = modelNodes.length === 0;
    const noSearchResults = !graphIsEmpty && query.trim().length > 0 && visibleModelNodes.length === 0;
    const visibleKey = useMemo(() => visibleModelNodes.map((node) => node.id).join("\u0000"), [visibleModelNodes]);
    const relationshipsById = useMemo(() => new Map(relationships.map((item) => [item.id, item])), [relationships]);
    const connectedLabelsById = useMemo(() => {
        const labels = new Map();
        const add = (id, label) => {
            const values = labels.get(id);
            if (values)
                values.push(label);
            else
                labels.set(id, [label]);
        };
        for (const relationship of relationships) {
            const source = nodesById.get(relationship.sourceId);
            const target = nodesById.get(relationship.targetId);
            if (!source || !target)
                continue;
            const relationshipLabel = relationship.invalid
                ? (relationship.invalidLabel ?? "invalid relationship")
                : (relationship.label ?? "relationship");
            add(relationship.sourceId, `${target.node.label} by ${relationshipLabel}`);
            add(relationship.targetId, `${source.node.label} by ${relationshipLabel}`);
        }
        return labels;
    }, [nodesById, relationships]);
    const selectedNodeInspector = selectedId !== null && nodesById.has(selectedId) ? inspector : null;
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
        if (selectedId === null || nodesById.has(selectedId)) {
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
            const firstNode = nodeRefs.current.get(visibleModelNodes[0]?.id ?? "");
            const emptyAction = rootRef.current?.querySelector(".od-relationship-graph-empty button, .od-relationship-graph-empty [href], .od-relationship-graph-column-actions button, .od-relationship-graph-column-actions [href]");
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
        const focusIsHidden = focusedNodeId !== null && !visibleNodeIds.has(focusedNodeId);
        const hoverIsHidden = hoveredNodeId !== null && !visibleNodeIds.has(hoveredNodeId);
        if (!focusIsHidden && !hoverIsHidden)
            return;
        updateState({
            focusedNodeId: focusIsHidden ? null : focusedNodeId,
            hoveredNodeId: hoverIsHidden ? null : hoveredNodeId,
        });
        if (!focusIsHidden)
            return;
        const firstNode = nodeRefs.current.get(visibleModelNodes[0]?.id ?? "");
        const emptyAction = rootRef.current?.querySelector(".od-relationship-graph-empty button, .od-relationship-graph-empty [href], .od-relationship-graph-invalid button, .od-relationship-graph-invalid [href], .od-relationship-graph-column-actions button, .od-relationship-graph-column-actions [href]");
        (firstNode ?? emptyAction ?? searchInputRef.current)?.focus({
            preventScroll: true,
        });
    }, [
        focusedNodeId,
        hoveredNodeId,
        visibleKey,
        visibleModelNodes,
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
    function changeQuery(nextQuery) {
        if (searchQuery === undefined)
            updateState({ internalQuery: nextQuery });
        onSearchQueryChange?.(nextQuery);
    }
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
    return (_jsxs("section", { ...props, "aria-label": ariaLabel, className: classes("od-relationship-graph", className), ref: rootRef, children: [_jsx("output", { "aria-live": "polite", className: "od-visually-hidden", children: announcement }), _jsxs("div", { className: "od-relationship-graph-search", children: [_jsxs("span", { className: "od-relationship-graph-search-field", children: [_jsx("label", { htmlFor: searchInputId, children: searchLabel }), _jsxs("span", { className: "od-relationship-graph-search-control", children: [_jsx("input", { "aria-label": searchLabel, id: searchInputId, onChange: (event) => {
                                            changeQuery(event.currentTarget.value);
                                        }, placeholder: searchPlaceholder, ref: searchInputRef, type: "search", value: query }), _jsx("kbd", { "aria-hidden": "true", children: "/" })] })] }), query ? (_jsx("button", { onClick: () => {
                            changeQuery("");
                        }, type: "button", children: clearSearchLabel })) : null] }), _jsx("section", { "aria-label": `${ariaLabel} viewport`, className: "od-relationship-graph-viewport", children: invalidState !== undefined ? (_jsx("div", { className: "od-relationship-graph-invalid", role: "alert", children: invalidState })) : (_jsxs("div", { className: "od-relationship-graph-board", ref: boardRef, children: [graphIsEmpty ? (_jsx("div", { "aria-live": "polite", className: "od-relationship-graph-empty", children: emptyState ?? "No items are available." })) : noSearchResults ? (_jsxs("div", { "aria-live": "polite", className: "od-relationship-graph-empty", children: [_jsx("strong", { children: noResultsTitle }), _jsx("div", { children: noResultsDescription }), _jsx("button", { onClick: () => {
                                        changeQuery("");
                                    }, type: "button", children: clearSearchLabel })] })) : null, _jsx("svg", { "aria-hidden": "true", className: "od-relationship-graph-connectors", height: "100%", width: "100%", children: edgeLayouts.map((layout) => {
                                const relationship = relationshipsById.get(layout.id);
                                if (!relationship ||
                                    !searchResult.visibleNodeIds.has(relationship.sourceId) ||
                                    !searchResult.visibleNodeIds.has(relationship.targetId)) {
                                    return null;
                                }
                                return (_jsx("path", { className: "od-relationship-graph-connector", d: layout.path, "data-active": activePath.relationshipIds.has(layout.id), "data-dimmed": activeNodeId !== null &&
                                        !activePath.relationshipIds.has(layout.id), "data-invalid": relationship.invalid ?? false, "data-relationship-id": layout.id, "data-selected": selectedPath.relationshipIds.has(layout.id) }, layout.id));
                            }) }), columns.map((column, columnIndex) => {
                            const visibleNodes = column.nodes.filter((node) => searchResult.visibleNodeIds.has(node.id));
                            return (_jsxs("section", { "aria-labelledby": `${columnHeadingPrefix}-${String(columnIndex)}`, className: "od-relationship-graph-column", "data-column-id": column.id, "data-column-index": columnIndex, children: [_jsxs("header", { className: "od-relationship-graph-column-header", children: [_jsxs("div", { children: [_jsx("h2", { id: `${columnHeadingPrefix}-${String(columnIndex)}`, children: column.label }), _jsx("span", { children: column.countLabel ?? String(visibleNodes.length) })] }), column.actions ? (_jsx("div", { className: "od-relationship-graph-column-actions", children: column.actions })) : null] }), _jsxs("div", { className: "od-relationship-graph-nodes", children: [visibleNodes.length === 0 ? (_jsx("div", { className: "od-relationship-graph-column-empty", children: column.emptyState ?? "No items in this column." })) : null, visibleNodes.map((node) => {
                                                const connectedLabels = connectedLabelsById.get(node.id) ?? [];
                                                const state = node.state ?? "default";
                                                const stateLabel = node.stateLabel ?? nodeStateLabels[state];
                                                const active = activePath.nodeIds.has(node.id);
                                                const dimmed = activeNodeId !== null && !active;
                                                return (_jsxs("button", { "aria-label": nodeAccessibleName(node, column, connectedLabels), "aria-pressed": selectedId === node.id, className: "od-relationship-graph-node", "data-active": active, "data-dimmed": dimmed, "data-node-id": node.id, "data-search-match": searchResult.directMatchIds.has(node.id), "data-selected": selectedId === node.id, "data-state": state, onBlur: () => {
                                                        updateState({ focusedNodeId: null });
                                                    }, onClick: (event) => {
                                                        activateNode(node.id, event.currentTarget);
                                                    }, onFocus: () => {
                                                        updateState({ focusedNodeId: node.id });
                                                    }, onKeyDown: (event) => {
                                                        handleNodeKeyDown(event, node.id);
                                                    }, onMouseEnter: () => {
                                                        updateState({ hoveredNodeId: node.id });
                                                    }, onMouseLeave: () => {
                                                        updateState({ hoveredNodeId: null });
                                                    }, ref: (element) => {
                                                        if (element)
                                                            nodeRefs.current.set(node.id, element);
                                                        else
                                                            nodeRefs.current.delete(node.id);
                                                    }, tabIndex: preferredTabStop === node.id ? 0 : -1, type: "button", children: [_jsxs("span", { className: "od-relationship-graph-node-heading", children: [_jsx("strong", { children: node.label }), state !== "default" ? (_jsx("span", { className: "od-relationship-graph-node-state", children: stateLabel })) : null] }), node.detail ? (_jsx("span", { className: "od-relationship-graph-node-detail", children: node.detail })) : null, node.content ? (_jsx("span", { className: "od-relationship-graph-node-content", children: node.content })) : null] }, node.id));
                                            })] })] }, column.id));
                        })] })) }), activeInspector] }));
}
//# sourceMappingURL=RelationshipGraph.js.map