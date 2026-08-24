import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
const DEFAULT_MAX_ROWS = 200;
const EMPTY_ACTIONS = [];
/** A host-neutral table with a semantic desktop view and accessible phone cards. */
export function DataTable({ actions = EMPTY_ACTIONS, actionsLabel = "Actions", ariaLabel, className, columns, density = "default", expansion, filters, getRowId, getRowLabel, isRowDisabled = () => false, isRowPending = () => false, liveMessage, loadMore, maxRows = DEFAULT_MAX_ROWS, minimumWidth = "40rem", rows, search, selection, sort, state, toolbarLabel, ...props }) {
    const rowIds = rows.map(getRowId);
    const rowLabels = rows.map(getRowLabel);
    validateDataTable({
        actions,
        actionsLabel,
        ariaLabel,
        columns,
        maxRows,
        rowIds,
        rowLabels,
        rows,
    });
    const tableId = useId();
    const rootRef = useRef(null);
    const focusSnapshotRef = useRef(null);
    const actionLocksRef = useRef(new Set());
    const loadLockRef = useRef(false);
    const [localPendingActions, setLocalPendingActions] = useState(() => new Set());
    const [localLoadPending, setLocalLoadPending] = useState(false);
    const rowSignature = JSON.stringify(rowIds);
    const selectedIds = new Set(selection?.selectedRowIds ?? []);
    const expandedIds = new Set(expansion?.expandedRowIds ?? []);
    const selectionMode = selection?.mode ?? "multiple";
    const leadingColumnCount = Number(Boolean(selection)) + Number(Boolean(expansion));
    const totalColumnCount = leadingColumnCount + columns.length + Number(actions.length > 0);
    const effectiveState = state ??
        (rows.length === 0
            ? { kind: "empty", message: "No rows are available." }
            : { kind: "ready" });
    const showRows = rows.length > 0 &&
        effectiveState.kind !== "empty" &&
        !(effectiveState.kind === "loading" && rows.length === 0);
    const tableBusy = effectiveState.kind === "loading" ||
        Boolean(loadMore?.loading) ||
        localLoadPending;
    const boundedLoadMore = loadMore && rows.length >= maxRows
        ? {
            completeLabel: loadMore.completeLabel ?? "The row limit is loaded",
            hasMore: false,
            loadedLabel: loadMore.loadedLabel,
        }
        : loadMore;
    useLayoutEffect(() => {
        const root = rootRef.current;
        const snapshot = focusSnapshotRef.current;
        if (!root || !snapshot || typeof document === "undefined")
            return;
        if (root.contains(document.activeElement))
            return;
        if (document.activeElement !== null &&
            document.activeElement !== document.body) {
            return;
        }
        const currentRowIds = JSON.parse(rowSignature);
        const replacementId = currentRowIds[Math.min(snapshot.rowIndex, currentRowIds.length - 1)];
        const target = replacementId
            ? findVisibleControl(root, replacementId, snapshot.control)
            : findVisibleFallback(root);
        target?.focus();
    }, [rowSignature]);
    const runAction = (action, row, rowIndex, rowId) => {
        const lockKey = `${rowId}\u0000${action.key}`;
        if (actionLocksRef.current.has(lockKey))
            return;
        actionLocksRef.current.add(lockKey);
        setLocalPendingActions((current) => new Set(current).add(lockKey));
        let result;
        try {
            result = action.onAction(row, rowIndex);
        }
        catch (error) {
            releaseActionLock(lockKey, actionLocksRef, setLocalPendingActions);
            throw error;
        }
        if (isPromise(result)) {
            void result.then(() => {
                releaseActionLock(lockKey, actionLocksRef, setLocalPendingActions);
            }, () => {
                releaseActionLock(lockKey, actionLocksRef, setLocalPendingActions);
            });
        }
        else {
            queueMicrotask(() => {
                releaseActionLock(lockKey, actionLocksRef, setLocalPendingActions);
            });
        }
    };
    const runLoadAction = (action) => {
        if (!action || loadLockRef.current || loadMore?.loading)
            return;
        loadLockRef.current = true;
        setLocalLoadPending(true);
        let result;
        try {
            result = action();
        }
        catch (error) {
            releaseLoadLock(loadLockRef, setLocalLoadPending);
            throw error;
        }
        if (isPromise(result)) {
            void result.then(() => {
                releaseLoadLock(loadLockRef, setLocalLoadPending);
            }, () => {
                releaseLoadLock(loadLockRef, setLocalLoadPending);
            });
        }
        else {
            queueMicrotask(() => {
                releaseLoadLock(loadLockRef, setLocalLoadPending);
            });
        }
    };
    const renderContext = (row, rowIndex) => {
        const rowId = rowIds[rowIndex] ?? "";
        return {
            row,
            rowId,
            rowIndex,
            selected: selectedIds.has(rowId),
            expanded: expandedIds.has(rowId),
            disabled: isRowDisabled(row, rowIndex),
            pending: isRowPending(row, rowIndex),
        };
    };
    const setSelection = (row, rowIndex, selected) => {
        if (!selection)
            return;
        const rowId = rowIds[rowIndex] ?? "";
        if (selectionMode === "single") {
            selection.onChange(selected ? [rowId] : []);
            return;
        }
        const next = new Set(selection.selectedRowIds);
        if (selected)
            next.add(rowId);
        else
            next.delete(rowId);
        selection.onChange([...next]);
    };
    const setExpanded = (rowId, expanded) => {
        if (!expansion)
            return;
        const next = new Set(expansion.expandedRowIds);
        if (expanded)
            next.add(rowId);
        else
            next.delete(rowId);
        expansion.onChange([...next]);
    };
    const eligibleRowIds = rows.flatMap((row, rowIndex) => isRowDisabled(row, rowIndex) || isRowPending(row, rowIndex)
        ? []
        : [rowIds[rowIndex] ?? ""]);
    const selectedEligibleCount = eligibleRowIds.filter((rowId) => selectedIds.has(rowId)).length;
    return (_jsxs("section", { ...props, "aria-label": ariaLabel, "aria-busy": tableBusy || undefined, className: [
            "od-data-table",
            `od-data-table-density-${density}`,
            className,
        ]
            .filter(Boolean)
            .join(" "), ref: rootRef, tabIndex: props.tabIndex ?? -1, onFocusCapture: (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement))
                return;
            const rowElement = target.closest("[data-data-table-row]");
            const controlElement = target.closest("[data-data-table-control]");
            if (!rowElement || !controlElement)
                return;
            const rowId = rowElement.dataset.dataTableRow;
            const control = controlElement.dataset.dataTableControl;
            const rowIndex = rowId ? rowIds.indexOf(rowId) : -1;
            if (rowId && control && rowIndex >= 0) {
                focusSnapshotRef.current = { rowId, rowIndex, control };
            }
        }, children: [search || filters ? (_jsxs("search", { "aria-label": labelOrFallback(toolbarLabel, `${ariaLabel} search and filters`), className: "od-data-table-toolbar", children: [search ? _jsx("div", { className: "od-data-table-search", children: search }) : null, filters ? (_jsx("div", { className: "od-data-table-filters", children: filters })) : null] })) : null, _jsx(DataTableStateBanner, { hasRows: rows.length > 0, localRetryPending: localLoadPending, onRetry: () => {
                    if (effectiveState.kind === "error") {
                        runLoadAction(effectiveState.onRetry);
                    }
                }, state: effectiveState }), showRows ? (_jsx(DataTableContent, { actions: actions, actionsLabel: actionsLabel, ariaLabel: ariaLabel, columns: columns, eligibleRowIds: eligibleRowIds, expansion: expansion, localPendingActions: localPendingActions, minimumWidth: minimumWidth, onAction: runAction, onExpand: setExpanded, onSelect: setSelection, renderContext: renderContext, rowLabels: rowLabels, rows: rows, selectedEligibleCount: selectedEligibleCount, selection: selection, selectionMode: selectionMode, sort: sort, tableBusy: tableBusy, tableId: tableId, totalColumnCount: totalColumnCount })) : null, _jsx(DataTableLoadMoreControl, { ariaLabel: ariaLabel, loadMore: boundedLoadMore, localPending: localLoadPending, rowCount: rows.length, runAction: runLoadAction }), _jsx("output", { "aria-live": "polite", className: "od-visually-hidden", children: liveMessage ?? `${String(rows.length)} rows loaded.` })] }));
}
function DataTableContent({ actions, actionsLabel, ariaLabel, columns, eligibleRowIds, expansion, localPendingActions, minimumWidth, onAction, onExpand, onSelect, renderContext, rowLabels, rows, selectedEligibleCount, selection, selectionMode, sort, tableBusy, tableId, totalColumnCount, }) {
    const scrollRef = useRef(null);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "od-data-table-scroll-controls", children: [_jsx("button", { "aria-label": `Scroll ${ariaLabel} left`, onClick: () => {
                            scrollRef.current?.scrollBy({ behavior: "smooth", left: -320 });
                        }, type: "button", children: _jsx("span", { "aria-hidden": "true", children: "\u2190" }) }), _jsx("button", { "aria-label": `Scroll ${ariaLabel} right`, onClick: () => {
                            scrollRef.current?.scrollBy({ behavior: "smooth", left: 320 });
                        }, type: "button", children: _jsx("span", { "aria-hidden": "true", children: "\u2192" }) })] }), _jsx("section", { "aria-label": `${ariaLabel} scrollable table`, className: "od-data-table-desktop", ref: scrollRef, children: _jsxs("table", { "aria-busy": tableBusy || undefined, className: "od-data-table-table", style: { minWidth: minimumWidth }, children: [_jsx("caption", { className: "od-visually-hidden", children: ariaLabel }), _jsxs("colgroup", { children: [selection ? (_jsx("col", { className: "od-data-table-selection-column" })) : null, expansion ? (_jsx("col", { className: "od-data-table-expansion-column" })) : null, columns.map((column) => (_jsx("col", { style: { width: column.width } }, column.key))), actions.length > 0 ? (_jsx("col", { className: "od-data-table-actions-column" })) : null] }), _jsx("thead", { children: _jsxs("tr", { children: [selection ? (_jsx("th", { className: "od-data-table-control-heading", scope: "col", children: selectionMode === "multiple" ? (_jsx(SelectAllControl, { allSelected: eligibleRowIds.length > 0 &&
                                                selectedEligibleCount === eligibleRowIds.length, disabled: eligibleRowIds.length === 0 || tableBusy, indeterminate: selectedEligibleCount > 0 &&
                                                selectedEligibleCount < eligibleRowIds.length, label: labelOrFallback(selection.selectAllLabel, "Select all visible rows"), onChange: (checked) => {
                                                const next = new Set(selection.selectedRowIds);
                                                for (const rowId of eligibleRowIds) {
                                                    if (checked)
                                                        next.add(rowId);
                                                    else
                                                        next.delete(rowId);
                                                }
                                                selection.onChange([...next]);
                                            } })) : (_jsx("span", { className: "od-visually-hidden", children: "Select" })) })) : null, expansion ? (_jsx("th", { className: "od-data-table-control-heading", scope: "col", children: _jsx("span", { className: "od-visually-hidden", children: "Details" }) })) : null, columns.map((column) => (_jsx("th", { "aria-sort": sort?.columnKey === column.key
                                            ? sort.direction
                                            : column.sortable
                                                ? "none"
                                                : undefined, className: `od-data-table-align-${column.align ?? "start"}`, scope: "col", children: column.sortable && sort ? (_jsx(SortControl, { column: column, sort: sort })) : (column.header) }, column.key))), actions.length > 0 ? (_jsx("th", { className: "od-data-table-actions-heading", scope: "col", children: actionsLabel })) : null] }) }), _jsx("tbody", { children: rows.map((row, rowIndex) => {
                                const context = renderContext(row, rowIndex);
                                return (_jsx(TableRows, { actions: actions, actionsLabel: actionsLabel, columns: columns, context: context, expansion: expansion, localPendingActions: localPendingActions, onAction: onAction, onExpand: onExpand, onSelect: onSelect, rowLabel: rowLabels[rowIndex] ?? "", selection: selection, selectionName: `${tableId}-desktop-selection`, selectionMode: selectionMode, tableId: tableId, totalColumnCount: totalColumnCount }, context.rowId));
                            }) })] }) }), _jsx("ul", { "aria-label": `${ariaLabel} cards`, className: "od-data-table-cards", children: rows.map((row, rowIndex) => {
                    const context = renderContext(row, rowIndex);
                    return (_jsx(PhoneCard, { actions: actions, actionsLabel: actionsLabel, columns: columns, context: context, expansion: expansion, localPendingActions: localPendingActions, onAction: onAction, onExpand: onExpand, onSelect: onSelect, rowLabel: rowLabels[rowIndex] ?? "", selection: selection, selectionName: `${tableId}-card-selection`, selectionMode: selectionMode, tableId: tableId }, context.rowId));
                }) })] }));
}
function TableRows({ actions, actionsLabel, columns, context, expansion, localPendingActions, onAction, onExpand, onSelect, rowLabel, selection, selectionName, selectionMode, tableId, totalColumnCount, }) {
    const detailId = `${tableId}-desktop-${String(context.rowIndex)}-detail`;
    return (_jsxs(_Fragment, { children: [_jsxs("tr", { "aria-disabled": context.disabled || undefined, "aria-busy": context.pending || undefined, "data-data-table-row": context.rowId, "data-expanded": context.expanded || undefined, "data-selected": context.selected || undefined, children: [selection ? (_jsx("td", { className: "od-data-table-control-cell", children: _jsx(SelectionControl, { context: context, label: labelOrFallback(selection.getLabel?.(context.row, context.rowIndex), `Select ${rowLabel}`), mode: selectionMode, name: selectionName, onChange: onSelect }) })) : null, expansion ? (_jsx("td", { className: "od-data-table-control-cell", children: _jsx(ExpansionControl, { context: context, detailId: detailId, expansion: expansion, onChange: onExpand, rowLabel: rowLabel }) })) : null, columns.map((column) => (_jsx("td", { className: `od-data-table-cell od-data-table-align-${column.align ?? "start"}`, children: column.render(context) }, column.key))), actions.length > 0 ? (_jsx("td", { className: "od-data-table-actions-cell", children: _jsx(ActionControls, { actions: actions, context: context, label: actionsLabel, localPendingActions: localPendingActions, onAction: onAction }) })) : null] }), expansion && context.expanded ? (_jsx("tr", { className: "od-data-table-detail-row", children: _jsx("td", { colSpan: totalColumnCount, children: _jsx("div", { className: "od-data-table-detail", id: detailId, children: expansion.detail(context) }) }) })) : null] }));
}
function PhoneCard({ actions, actionsLabel, columns, context, expansion, localPendingActions, onAction, onExpand, onSelect, rowLabel, selection, selectionName, selectionMode, tableId, }) {
    const rowDomId = String(context.rowIndex);
    const headingId = `${tableId}-card-${rowDomId}-heading`;
    const detailId = `${tableId}-card-${rowDomId}-detail`;
    return (_jsx("li", { "aria-busy": context.pending || undefined, className: "od-data-table-card", "data-data-table-row": context.rowId, "data-expanded": context.expanded || undefined, "data-selected": context.selected || undefined, children: _jsxs("article", { "aria-labelledby": headingId, children: [_jsxs("header", { className: "od-data-table-card-heading", children: [_jsx("strong", { className: "od-data-table-card-title", id: headingId, children: rowLabel }), _jsxs("div", { className: "od-data-table-card-controls", children: [selection ? (_jsx(SelectionControl, { context: context, label: labelOrFallback(selection.getLabel?.(context.row, context.rowIndex), `Select ${rowLabel}`), mode: selectionMode, name: selectionName, onChange: onSelect })) : null, expansion ? (_jsx(ExpansionControl, { context: context, detailId: detailId, expansion: expansion, onChange: onExpand, rowLabel: rowLabel })) : null] })] }), _jsx("dl", { className: "od-data-table-card-values", children: columns.map((column) => (_jsxs("div", { className: "od-data-table-card-value", children: [_jsx("dt", { children: column.phoneLabel ?? column.header }), _jsx("dd", { className: `od-data-table-align-${column.align ?? "start"}`, children: column.render(context) })] }, column.key))) }), expansion && context.expanded ? (_jsx("div", { className: "od-data-table-detail", id: detailId, children: expansion.detail(context) })) : null, actions.length > 0 ? (_jsx("footer", { className: "od-data-table-card-actions", children: _jsx(ActionControls, { actions: actions, context: context, label: actionsLabel, localPendingActions: localPendingActions, onAction: onAction }) })) : null] }) }));
}
function SortControl({ column, sort, }) {
    const nextDirection = sort.columnKey === column.key && sort.direction === "ascending"
        ? "descending"
        : "ascending";
    const fallbackLabel = `Sort by ${plainText(column.header) ?? column.key} ${nextDirection}`;
    return (_jsxs("button", { "aria-label": labelOrFallback(sort.getLabel?.(column.key, nextDirection), fallbackLabel), className: "od-data-table-sort-control", onClick: () => {
            sort.onChange(column.key, nextDirection);
        }, type: "button", children: [_jsx("span", { children: column.header }), _jsx("span", { "aria-hidden": "true", className: "od-data-table-sort-indicator", children: sort.columnKey === column.key
                    ? sort.direction === "ascending"
                        ? "↑"
                        : "↓"
                    : "↕" })] }));
}
function SelectAllControl({ allSelected, disabled, indeterminate, label, onChange, }) {
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current)
            inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);
    return (_jsx("input", { "aria-label": label, checked: allSelected, className: "od-data-table-selection-control", "data-data-table-control": "select-all", disabled: disabled, onChange: (event) => {
            onChange(event.currentTarget.checked);
        }, ref: inputRef, type: "checkbox" }));
}
function SelectionControl({ context, label, mode, name, onChange, }) {
    return (_jsx("input", { "aria-label": label, checked: context.selected, className: "od-data-table-selection-control", "data-data-table-control": "selection", disabled: context.disabled || context.pending, name: mode === "single" ? name : undefined, onChange: (event) => {
            onChange(context.row, context.rowIndex, event.currentTarget.checked);
        }, type: mode === "single" ? "radio" : "checkbox" }));
}
function ExpansionControl({ context, detailId, expansion, onChange, rowLabel, }) {
    const fallbackLabel = `${context.expanded ? "Hide" : "Show"} details for ${rowLabel}`;
    return (_jsx("button", { "aria-controls": context.expanded ? detailId : undefined, "aria-expanded": context.expanded, "aria-label": labelOrFallback(expansion.getLabel?.(context.row, context.rowIndex, context.expanded), fallbackLabel), className: "od-data-table-expansion-control", "data-data-table-control": "expansion", disabled: context.disabled || context.pending, onClick: () => {
            onChange(context.rowId, !context.expanded);
        }, type: "button", children: _jsx("span", { "aria-hidden": "true", children: context.expanded ? "−" : "+" }) }));
}
function ActionControls({ actions, context, label, localPendingActions, onAction, }) {
    return (_jsxs("fieldset", { className: "od-data-table-actions", children: [_jsx("legend", { className: "od-visually-hidden", children: label }), actions.map((action) => {
                const lockKey = `${context.rowId}\u0000${action.key}`;
                const actionPending = context.pending ||
                    Boolean(action.pending?.(context.row, context.rowIndex)) ||
                    localPendingActions.has(lockKey);
                const disabled = context.disabled ||
                    actionPending ||
                    Boolean(action.disabled?.(context.row, context.rowIndex));
                const labelText = labelOrFallback(actionPending
                    ? (action.pendingLabel?.(context.row, context.rowIndex) ??
                        action.label(context.row, context.rowIndex))
                    : action.label(context.row, context.rowIndex), `Action ${action.key}`);
                return (_jsx("button", { "aria-busy": actionPending || undefined, className: "od-data-table-action", "data-data-table-control": `action:${action.key}`, disabled: disabled, onClick: () => {
                        onAction(action, context.row, context.rowIndex, context.rowId);
                    }, type: "button", children: labelText }, action.key));
            })] }));
}
function DataTableStateBanner({ hasRows, localRetryPending, onRetry, state, }) {
    if (state.kind === "ready" && state.message === undefined)
        return null;
    if (hasRows && state.kind === "loading") {
        return (_jsx("output", { "aria-live": "polite", className: "od-data-table-state od-data-table-state-loading", children: state.message }));
    }
    if (state.kind === "error") {
        const pending = Boolean(state.retryPending) || localRetryPending;
        return (_jsxs("div", { className: "od-data-table-state od-data-table-state-error", role: "alert", children: [_jsx("div", { children: state.message }), state.onRetry ? (_jsx("button", { "aria-busy": pending || undefined, "data-data-table-fallback": "true", disabled: pending, onClick: () => {
                        onRetry();
                    }, type: "button", children: pending ? "Retrying…" : labelOrFallback(state.retryLabel, "Retry") })) : null] }));
    }
    if (state.kind === "stale") {
        return (_jsx("output", { className: "od-data-table-state od-data-table-state-stale", children: state.message }));
    }
    if (state.kind === "ready") {
        return _jsx("output", { className: "od-data-table-state", children: state.message });
    }
    return (_jsx("output", { "aria-busy": state.kind === "loading" || undefined, "aria-live": "polite", className: `od-data-table-state od-data-table-state-${state.kind}`, children: state.message }));
}
function DataTableLoadMoreControl({ ariaLabel, loadMore, localPending, rowCount, runAction, }) {
    if (!loadMore)
        return null;
    const pending = Boolean(loadMore.loading) || localPending;
    const loadedLabel = loadMore.loadedLabel ?? `${String(rowCount)} loaded`;
    if (loadMore.error) {
        return (_jsxs("section", { "aria-label": `${ariaLabel} row loading error`, className: "od-data-table-load-more", children: [_jsx("output", { "aria-live": "assertive", children: loadMore.error }), _jsx("span", { children: loadedLabel }), loadMore.onRetry ? (_jsx("button", { "aria-busy": pending || undefined, "data-data-table-fallback": "true", disabled: pending, onClick: () => {
                        runAction(loadMore.onRetry);
                    }, type: "button", children: pending
                        ? labelOrFallback(loadMore.loadingLabel, "Loading rows…")
                        : labelOrFallback(loadMore.retryLabel, "Retry loading rows") })) : null] }));
    }
    if (!loadMore.hasMore) {
        return (_jsxs("output", { className: "od-data-table-load-more", "aria-live": "polite", children: [_jsx("span", { children: loadMore.completeLabel ?? "All rows loaded" }), _jsx("span", { children: loadedLabel })] }));
    }
    return (_jsxs("section", { "aria-label": `${ariaLabel} load more rows`, className: "od-data-table-load-more", children: [_jsx("button", { "aria-busy": pending || undefined, "data-data-table-fallback": "true", disabled: pending || !loadMore.onLoadMore, onClick: () => {
                    runAction(loadMore.onLoadMore);
                }, type: "button", children: pending
                    ? labelOrFallback(loadMore.loadingLabel, "Loading rows…")
                    : labelOrFallback(loadMore.loadLabel, "Load more rows") }), _jsx("span", { children: loadedLabel })] }));
}
function validateDataTable({ actions, actionsLabel, ariaLabel, columns, maxRows, rowIds, rowLabels, rows, }) {
    if (!ariaLabel.trim())
        throw new TypeError("DataTable ariaLabel must not be empty.");
    if (columns.length === 0)
        throw new RangeError("DataTable must have at least one column.");
    if (!Number.isSafeInteger(maxRows) || maxRows < 1) {
        throw new RangeError("DataTable maxRows must be a positive safe integer.");
    }
    if (rows.length > maxRows) {
        throw new RangeError(`DataTable accepts at most ${String(maxRows)} rows.`);
    }
    const columnKeys = columns.map((column) => column.key);
    assertUniqueNonEmptyValues("column key", columnKeys);
    assertUniqueNonEmptyValues("row identifier", rowIds);
    assertNonEmptyValues("row label", rowLabels);
    assertUniqueNonEmptyValues("action key", actions.map((action) => action.key));
    if (actions.length > 0 && !actionsLabel.trim()) {
        throw new TypeError("DataTable actionsLabel must not be empty.");
    }
}
function assertUniqueNonEmptyValues(name, values) {
    const seen = new Set();
    for (const value of values) {
        if (!value.trim())
            throw new TypeError(`DataTable ${name} must not be empty.`);
        if (seen.has(value))
            throw new TypeError(`DataTable has duplicate ${name}s.`);
        seen.add(value);
    }
}
function assertNonEmptyValues(name, values) {
    for (const value of values) {
        if (!value.trim()) {
            throw new TypeError(`DataTable ${name} must not be empty.`);
        }
    }
}
function plainText(value) {
    return typeof value === "string" || typeof value === "number"
        ? String(value)
        : null;
}
function labelOrFallback(value, fallback) {
    return value?.trim() ? value : fallback;
}
function isPromise(value) {
    return ((typeof value === "object" || typeof value === "function") &&
        value !== null &&
        "then" in value &&
        typeof value.then === "function");
}
function releaseLoadLock(lockRef, setPending) {
    lockRef.current = false;
    setPending(false);
}
function releaseActionLock(lockKey, lockRef, setPending) {
    lockRef.current.delete(lockKey);
    setPending((current) => {
        const next = new Set(current);
        next.delete(lockKey);
        return next;
    });
}
function findVisibleControl(root, rowId, control) {
    const candidates = root.querySelectorAll("[data-data-table-row] [data-data-table-control]");
    for (const candidate of candidates) {
        const row = candidate.closest("[data-data-table-row]");
        if (row?.dataset.dataTableRow === rowId &&
            candidate.dataset.dataTableControl === control &&
            candidate.getClientRects().length > 0 &&
            !candidate.matches(":disabled")) {
            return candidate;
        }
    }
    return null;
}
function findVisibleFallback(root) {
    const candidates = root.querySelectorAll("[data-data-table-fallback], .od-data-table-desktop");
    for (const candidate of candidates) {
        if (candidate.getClientRects().length > 0 &&
            !candidate.matches(":disabled")) {
            return candidate;
        }
    }
    return root.getClientRects().length > 0 ? root : null;
}
//# sourceMappingURL=DataTable.js.map