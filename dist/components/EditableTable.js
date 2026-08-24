import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState, } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { DataTable, } from "./DataTable.js";
const EMPTY_MESSAGES = new Map();
const EMPTY_PENDING = new Set();
/** A controlled inline editor that uses DataTable for all record presentation. */
// react-doctor-disable-next-line react-doctor/no-giant-component, react-doctor/no-event-handler -- This coordinator keeps one row lock, controlled host-row focus synchronization, and one DataTable action model; render-only pieces are already separate.
export function EditableTable({ ariaLabel, cancelLabel = "Cancel", className, columns, deleteLabel = "Delete", density, editLabel = "Edit", filters, getDeleteConfirmation, liveMessage, loadMore, maxRows, minimumWidth, onCancel, onCreate, onDelete, onDraftChange, onEdit, onBlur, onPointerDownCapture, onSave, reorder, rows, saveLabel = "Save", saveMode = "automatic", search, state, toolbarLabel, validate, ...props }) {
    validateEditableTable(ariaLabel, columns, rows, saveMode, onSave, onCreate);
    const tableId = useId();
    const rootRef = useRef(null);
    const mountedRef = useRef(true);
    const operationLocksRef = useRef(new Map());
    const suppressAutomaticSaveRef = useRef(new Set());
    const suppressClearFrameRef = useRef(null);
    // react-doctor-disable-next-line react-doctor/no-event-handler -- The row signature synchronizes focus after a controlled host replacement.
    const rowIds = rows.map((row) => row.id);
    const rowSignature = JSON.stringify(rowIds);
    const rowCreateSignature = JSON.stringify(rows.map((row) => [row.id, Boolean(row.isNew)]));
    const previousRowIdsRef = useRef(new Set(rowIds));
    const previousRowOrderRef = useRef(rowIds);
    const rowLifecycleVersionsRef = useRef(new Map(rowIds.map((rowId) => [rowId, 0])));
    const pendingCreatedFocusRef = useRef(null);
    const pendingDeletedFocusRef = useRef(null);
    const [messages, setMessages] = useState(EMPTY_MESSAGES);
    const [pendingRowIds, setPendingRowIds] = useState(EMPTY_PENDING);
    const [deleteRowId, setDeleteRowId] = useState(null);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (suppressClearFrameRef.current !== null) {
                cancelAnimationFrame(suppressClearFrameRef.current);
            }
        };
    }, []);
    // react-doctor-disable-next-line react-doctor/no-cascading-set-state -- One controlled row removal invalidates messages, pending state, and an open dialog as one identity-boundary update.
    useEffect(() => {
        const activeRowIds = JSON.parse(rowSignature);
        const activeCreateEntries = JSON.parse(rowCreateSignature);
        const activeNewState = new Map(activeCreateEntries);
        const activeIds = new Set(activeRowIds);
        const previousRowIds = previousRowIdsRef.current;
        for (const previousRowId of previousRowIds) {
            if (activeIds.has(previousRowId))
                continue;
            rowLifecycleVersionsRef.current.set(previousRowId, (rowLifecycleVersionsRef.current.get(previousRowId) ?? 0) + 1);
            operationLocksRef.current.delete(previousRowId);
            suppressAutomaticSaveRef.current.delete(previousRowId);
        }
        /* eslint-disable react-hooks/set-state-in-effect -- A controlled row removal must invalidate local state before the same identifier can represent a later record. */
        // react-doctor-disable-next-line react-doctor/no-chain-state-updates, react-doctor/no-derived-state -- A controlled row removal is an identity boundary; normalization prevents a later record from inheriting the absent row's messages or pending state.
        setMessages((current) => {
            if ([...current.keys()].every((rowId) => activeIds.has(rowId))) {
                return current;
            }
            return new Map([...current].filter(([rowId]) => activeIds.has(rowId)));
        });
        // react-doctor-disable-next-line react-doctor/no-chain-state-updates, react-doctor/no-derived-state -- Pending row operations are local async state; an absent controlled identity must not transfer that state to a later record.
        setPendingRowIds((current) => {
            if ([...current].every((rowId) => activeIds.has(rowId)))
                return current;
            return new Set([...current].filter((rowId) => activeIds.has(rowId)));
        });
        /* eslint-enable react-hooks/set-state-in-effect */
        // react-doctor-disable-next-line react-doctor/no-event-handler -- Controlled row removal is the event that closes its stale dialog target and restores focus.
        if (deleteRowId !== null && !activeIds.has(deleteRowId)) {
            const removedIndex = previousRowOrderRef.current.indexOf(deleteRowId);
            pendingDeletedFocusRef.current = {
                rowId: deleteRowId,
                rowIndex: Math.max(0, removedIndex),
            };
            // react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change, react-doctor/no-derived-state -- The absent controlled target must close before a later record can reuse its identifier.
            setDeleteRowId((current) => (current === deleteRowId ? null : current));
        }
        const created = pendingCreatedFocusRef.current;
        if (created) {
            const newRowId = (created.returnedRowId && activeIds.has(created.returnedRowId)
                ? created.returnedRowId
                : activeIds.has(created.sourceRowId) &&
                    activeNewState.get(created.sourceRowId) === false
                    ? created.sourceRowId
                    : activeRowIds.find((rowId) => !created.previousRowIds.has(rowId))) ?? null;
            if (newRowId && focusRowControl(rootRef.current, newRowId)) {
                pendingCreatedFocusRef.current = null;
            }
            else if (!newRowId &&
                created.returnedRowId === undefined &&
                !activeIds.has(created.sourceRowId)) {
                pendingCreatedFocusRef.current = null;
            }
        }
        previousRowIdsRef.current = activeIds;
        previousRowOrderRef.current = activeRowIds;
    }, [deleteRowId, rowCreateSignature, rowSignature]);
    useEffect(() => {
        if (deleteRowId !== null || pendingDeletedFocusRef.current === null)
            return;
        const deleted = pendingDeletedFocusRef.current;
        const activeRowIds = JSON.parse(rowSignature);
        const frame = requestAnimationFrame(() => {
            const remainingRowIds = activeRowIds.filter((rowId) => rowId !== deleted.rowId);
            if (focusNearestRowControl(rootRef.current, remainingRowIds, deleted.rowIndex)) {
                pendingDeletedFocusRef.current = null;
            }
        });
        return () => {
            cancelAnimationFrame(frame);
        };
    }, [deleteRowId, rowSignature]);
    const suppressAutomaticSave = (rowId) => {
        suppressAutomaticSaveRef.current.add(rowId);
        if (suppressClearFrameRef.current !== null) {
            cancelAnimationFrame(suppressClearFrameRef.current);
        }
        suppressClearFrameRef.current = requestAnimationFrame(() => {
            suppressAutomaticSaveRef.current.clear();
            suppressClearFrameRef.current = null;
        });
    };
    const setMessage = (rowId, message) => {
        setMessages((current) => {
            const next = new Map(current);
            if (message)
                next.set(rowId, message);
            else
                next.delete(rowId);
            return next;
        });
    };
    const isRowOperationLocked = (row) => operationLocksRef.current.has(row.id) ||
        Boolean(row.locked) ||
        Boolean(row.saving) ||
        Boolean(row.deleting);
    const isCurrentRowLifecycle = (rowId, lifecycleVersion) => previousRowIdsRef.current.has(rowId) &&
        (rowLifecycleVersionsRef.current.get(rowId) ?? 0) === lifecycleVersion;
    const runRowOperation = async (row, operation, fallbackError) => {
        const lifecycleVersion = rowLifecycleVersionsRef.current.get(row.id) ?? 0;
        if (isRowOperationLocked(row)) {
            return { lifecycleVersion, ok: false };
        }
        const operationToken = Symbol(row.id);
        operationLocksRef.current.set(row.id, operationToken);
        setPendingRowIds((current) => new Set(current).add(row.id));
        setMessage(row.id, null);
        try {
            const value = await operation();
            return value === undefined
                ? { lifecycleVersion, ok: true }
                : { lifecycleVersion, ok: true, value };
        }
        catch {
            if (mountedRef.current &&
                isCurrentRowLifecycle(row.id, lifecycleVersion)) {
                setMessage(row.id, { error: fallbackError });
            }
            return { lifecycleVersion, ok: false };
        }
        finally {
            if (operationLocksRef.current.get(row.id) === operationToken) {
                operationLocksRef.current.delete(row.id);
                if (mountedRef.current) {
                    setPendingRowIds((current) => {
                        const next = new Set(current);
                        next.delete(row.id);
                        return next;
                    });
                }
            }
        }
    };
    const saveRow = async (row, rowIndex) => {
        if (isRowOperationLocked(row))
            return;
        if (!row.isNew && !row.dirty)
            return;
        const validation = validate?.(row, rowIndex) ?? row.validation;
        if (validation) {
            setMessage(row.id, { validation });
            focusInvalidControl(rootRef.current, row.id);
            return;
        }
        suppressAutomaticSave(row.id);
        if (row.isNew) {
            if (!onCreate)
                return;
            const previousRowIds = new Set(previousRowIdsRef.current);
            const pendingCreate = {
                previousRowIds,
                sourceRowId: row.id,
            };
            pendingCreatedFocusRef.current = pendingCreate;
            // react-doctor-disable-next-line react-doctor/async-defer-await -- The continuation must inspect mount and request identity after this asynchronous create settles.
            const result = await runRowOperation(row, () => onCreate(row.id, row.draft), "The row could not be created. Correct the values or try again.");
            if (!mountedRef.current)
                return;
            if (pendingCreatedFocusRef.current !== pendingCreate)
                return;
            if (result.ok) {
                const returnedRowId = typeof result.value === "string" ? result.value : undefined;
                if (returnedRowId === undefined &&
                    !isCurrentRowLifecycle(row.id, result.lifecycleVersion)) {
                    pendingCreatedFocusRef.current = null;
                    return;
                }
                pendingCreatedFocusRef.current = {
                    previousRowIds,
                    sourceRowId: row.id,
                    ...(returnedRowId === undefined ? {} : { returnedRowId }),
                };
                const currentRows = JSON.parse(rowSignature);
                const createdId = (returnedRowId !== undefined && currentRows.includes(returnedRowId)
                    ? returnedRowId
                    : currentRows.find((rowId) => !previousRowIds.has(rowId))) ?? null;
                if (createdId && focusRowControl(rootRef.current, createdId)) {
                    pendingCreatedFocusRef.current = null;
                }
            }
            else {
                pendingCreatedFocusRef.current = null;
            }
            return;
        }
        if (!onSave)
            return;
        await runRowOperation(row, () => onSave(row.id, row.draft), "The row could not be saved. Your draft is preserved.");
    };
    const cancelRow = (row) => {
        if (isRowOperationLocked(row))
            return;
        const lifecycleVersion = rowLifecycleVersionsRef.current.get(row.id) ?? 0;
        suppressAutomaticSave(row.id);
        setMessage(row.id, null);
        onCancel?.(row.id);
        requestAnimationFrame(() => {
            if (isCurrentRowLifecycle(row.id, lifecycleVersion)) {
                focusRowControl(rootRef.current, row.id);
            }
        });
    };
    const confirmDelete = async () => {
        const rowIndex = rows.findIndex((row) => row.id === deleteRowId);
        const row = rowIndex >= 0 ? rows[rowIndex] : undefined;
        if (!row || !onDelete || isRowOperationLocked(row))
            return;
        pendingDeletedFocusRef.current = { rowId: row.id, rowIndex };
        // react-doctor-disable-next-line react-doctor/async-defer-await -- The continuation must inspect mount and row lifecycle after this asynchronous delete settles.
        const result = await runRowOperation(row, () => onDelete(row.id, row), "The row could not be deleted. The row is unchanged.");
        if (!mountedRef.current)
            return;
        const currentLifecycle = isCurrentRowLifecycle(row.id, result.lifecycleVersion);
        if (result.ok) {
            if (currentLifecycle) {
                setDeleteRowId((current) => (current === row.id ? null : current));
            }
        }
        else if (currentLifecycle) {
            pendingDeletedFocusRef.current = null;
        }
    };
    const moveRow = async (row, rowIndex, direction) => {
        if (!reorder || isRowOperationLocked(row))
            return;
        const move = makeReorder(rows, row, rowIndex, direction, reorder);
        if (!move)
            return;
        const result = await runRowOperation(row, () => reorder.onReorder(move), "The row order could not be saved. The current order is unchanged.");
        if (!isCurrentRowLifecycle(row.id, result.lifecycleVersion))
            return;
        requestAnimationFrame(() => {
            focusRowControl(rootRef.current, row.id);
        });
    };
    const contexts = new Map();
    const contextFor = (row, rowIndex, presentation) => {
        const contextKey = JSON.stringify([row.id, presentation]);
        const existing = contexts.get(contextKey);
        if (existing)
            return existing;
        const pending = pendingRowIds.has(row.id) || Boolean(row.saving) || Boolean(row.deleting);
        const validation = messages.get(row.id)?.validation ?? row.validation;
        const error = messages.get(row.id)?.error ?? row.error;
        const context = {
            row,
            rowIndex,
            disabled: Boolean(row.locked) || pending,
            pending,
            presentation,
            validation,
            error,
            stale: Boolean(row.stale),
            messageId: `${tableId}-${presentation}-${String(rowIndex)}-messages`,
            validationId: `${tableId}-${presentation}-${String(rowIndex)}-validation`,
            errorId: `${tableId}-${presentation}-${String(rowIndex)}-error`,
            update: (patch) => {
                if (row.locked || pending)
                    return;
                setMessage(row.id, null);
                onDraftChange(row.id, patch);
            },
            save: () => {
                void saveRow(row, rowIndex);
            },
            cancel: () => {
                cancelRow(row);
            },
        };
        contexts.set(contextKey, context);
        return context;
    };
    const dataColumns = columns.map((column, columnIndex) => ({
        key: column.key,
        header: column.header,
        ...(column.phoneLabel === undefined
            ? {}
            : { phoneLabel: column.phoneLabel }),
        ...(column.width === undefined ? {} : { width: column.width }),
        ...(column.align === undefined ? {} : { align: column.align }),
        render: ({ presentation, row, rowIndex }) => {
            const context = contextFor(row, rowIndex, presentation ?? "desktop");
            const editing = (row.editing === true || row.isNew === true) && !context.pending;
            const content = editing
                ? column.renderEdit(context)
                : column.renderRead(context);
            return (_jsxs("div", { className: "od-editable-table-cell", "data-editable-table-cell": column.key, "data-editable-table-row": row.id, role: "presentation", onKeyDown: (event) => {
                    handleCellKeyDown(event, {
                        cancel: () => {
                            cancelRow(row);
                        },
                        ...(onDelete
                            ? {
                                deleteRow: () => {
                                    suppressAutomaticSave(row.id);
                                    setDeleteRowId(row.id);
                                },
                            }
                            : {}),
                        editing,
                        locked: Boolean(row.locked),
                        ...(saveMode === "batch"
                            ? {}
                            : {
                                save: () => {
                                    void saveRow(row, rowIndex);
                                },
                            }),
                    });
                }, children: [!editing &&
                        !context.pending &&
                        columnIndex === 0 &&
                        onEdit &&
                        !row.locked ? (_jsx("button", { "aria-label": `${editLabel} ${row.label}`, className: "od-editable-table-read-control", "data-data-table-control": "edit", onClick: () => {
                            setMessage(row.id, null);
                            onEdit(row.id);
                        }, type: "button", children: content })) : (content), columnIndex === 0 ? (_jsx(EditableRowMessages, { error: context.error, errorId: context.errorId, messageId: context.messageId, stale: context.stale, validation: context.validation, validationId: context.validationId })) : null] }));
        },
    }));
    const actions = [
        ...(saveMode === "explicit" && (onSave || onCreate)
            ? [
                {
                    key: "save",
                    label: (row) => `${row.isNew ? "Create" : saveLabel} ${row.label}`,
                    pendingLabel: (row) => `${row.isNew ? "Creating" : "Saving"} ${row.label}…`,
                    disabled: (row) => !row.isNew && (!row.editing || !row.dirty),
                    onAction: (row, rowIndex) => {
                        return saveRow(row, rowIndex);
                    },
                },
            ]
            : []),
        ...(onCancel
            ? [
                {
                    key: "cancel",
                    label: (row) => `${cancelLabel} ${row.label}`,
                    disabled: (row) => !row.editing && !row.isNew,
                    onAction: (row) => {
                        cancelRow(row);
                    },
                },
            ]
            : []),
        ...(onDelete
            ? [
                {
                    key: "delete",
                    label: (row) => `${deleteLabel} ${row.label}`,
                    disabled: (row) => Boolean(row.isNew),
                    onAction: (row) => {
                        setDeleteRowId(row.id);
                    },
                },
            ]
            : []),
        ...(reorder
            ? [
                {
                    key: "move-up",
                    label: (row) => `Move ${row.label} up`,
                    disabled: (row, rowIndex) => !makeReorder(rows, row, rowIndex, -1, reorder),
                    onAction: (row, rowIndex) => {
                        return moveRow(row, rowIndex, -1);
                    },
                },
                {
                    key: "move-down",
                    label: (row) => `Move ${row.label} down`,
                    disabled: (row, rowIndex) => !makeReorder(rows, row, rowIndex, 1, reorder),
                    onAction: (row, rowIndex) => {
                        return moveRow(row, rowIndex, 1);
                    },
                },
            ]
            : []),
    ];
    const dirtyRows = rows.filter((row) => Boolean(row.dirty) || Boolean(row.isNew));
    const invalidRows = rows.filter((row, rowIndex) => Boolean(messages.get(row.id)?.validation ??
        validate?.(row, rowIndex) ??
        row.validation));
    const pendingRows = rows.filter((row) => pendingRowIds.has(row.id) || Boolean(row.saving) || Boolean(row.deleting));
    const rowIndexById = new Map(rows.map((row, rowIndex) => [row.id, rowIndex]));
    const canBatchSave = dirtyRows.length > 0 &&
        invalidRows.length === 0 &&
        pendingRows.length === 0 &&
        dirtyRows.every((row) => !row.locked);
    const canBatchDiscard = dirtyRows.length > 0 &&
        pendingRows.length === 0 &&
        dirtyRows.every((row) => !row.locked);
    const deleteRowIndex = rows.findIndex((row) => row.id === deleteRowId);
    const deleteRow = deleteRowIndex >= 0 ? rows[deleteRowIndex] : undefined;
    const confirmation = deleteRow
        ? {
            title: `Delete ${deleteRow.label}?`,
            description: `Delete ${deleteRow.label}. This action cannot be undone.`,
            confirmLabel: `Delete ${deleteRow.label}`,
            ...getDeleteConfirmation?.(deleteRow, deleteRowIndex),
        }
        : null;
    const deleteError = deleteRow
        ? (messages.get(deleteRow.id)?.error ?? deleteRow.error)
        : null;
    return (_jsxs("section", { ...props, "aria-label": `${ariaLabel} editor`, className: ["od-editable-table", className].filter(Boolean).join(" "), onBlur: (event) => {
            onBlur?.(event);
            if (event.defaultPrevented)
                return;
            if (saveMode !== "automatic")
                return;
            const source = closestEditableRow(event.target);
            if (!source)
                return;
            const sourceTableRow = closestDataTableRow(event.target);
            const nextTableRow = closestDataTableRow(event.relatedTarget);
            if (sourceTableRow &&
                nextTableRow &&
                sourceTableRow.dataset.dataTableRow ===
                    nextTableRow.dataset.dataTableRow) {
                return;
            }
            const next = closestEditableRow(event.relatedTarget);
            if (next?.dataset.editableTableRow === source.dataset.editableTableRow)
                return;
            const rowIndex = rows.findIndex((row) => row.id === source.dataset.editableTableRow);
            const row = rowIndex >= 0 ? rows[rowIndex] : undefined;
            if (row && suppressAutomaticSaveRef.current.delete(row.id))
                return;
            if (row?.dirty && !row.isNew)
                void saveRow(row, rowIndex);
        }, onPointerDownCapture: (event) => {
            onPointerDownCapture?.(event);
            if (event.defaultPrevented)
                return;
            const target = event.target;
            if (!(target instanceof HTMLElement))
                return;
            if (!target.closest(".od-data-table-actions, .od-editable-table-batch-actions")) {
                return;
            }
            const row = target.closest("[data-data-table-row]");
            const rowId = row?.dataset.dataTableRow;
            if (rowId)
                suppressAutomaticSave(rowId);
        }, ref: rootRef, children: [_jsx(DataTable, { actions: actions, actionsLabel: "Row actions", ariaLabel: ariaLabel, columns: dataColumns, ...(density === undefined ? {} : { density }), filters: filters, getRowId: (row) => row.id, getRowLabel: (row) => row.label, isRowDisabled: (row) => Boolean(row.locked), isRowPending: (row) => pendingRowIds.has(row.id) ||
                    Boolean(row.saving) ||
                    Boolean(row.deleting), ...(liveMessage === undefined ? {} : { liveMessage }), ...(loadMore === undefined ? {} : { loadMore }), ...(maxRows === undefined ? {} : { maxRows }), ...(minimumWidth === undefined ? {} : { minimumWidth }), rows: rows, search: search, ...(state === undefined ? {} : { state }), ...(toolbarLabel === undefined ? {} : { toolbarLabel }) }), saveMode === "batch" ? (_jsxs("footer", { className: "od-editable-table-batch-actions", children: [_jsx("button", { disabled: !canBatchDiscard, onClick: () => {
                            for (const row of dirtyRows)
                                cancelRow(row);
                        }, type: "button", children: "Discard changes" }), _jsxs("button", { disabled: !canBatchSave, onClick: () => {
                            for (const row of dirtyRows) {
                                void saveRow(row, rowIndexById.get(row.id) ?? -1);
                            }
                        }, type: "button", children: ["Save ", String(dirtyRows.length), " changes"] })] })) : null, _jsx(ConfirmationDialog, { confirmLabel: confirmation?.confirmLabel ?? "Delete row", description: _jsxs(_Fragment, { children: [_jsx("div", { children: confirmation?.description ?? "Delete this row." }), deleteError ? (_jsx("p", { className: "od-editable-table-dialog-error", role: "alert", children: deleteError })) : null] }), ...(confirmation?.impactLabel === undefined
                    ? {}
                    : { impactLabel: confirmation.impactLabel }), ...(confirmation?.impactStatement === undefined
                    ? {}
                    : { impactStatement: confirmation.impactStatement }), onCancel: () => {
                    if (deleteRow &&
                        !operationLocksRef.current.has(deleteRow.id) &&
                        !deleteRow.deleting) {
                        setDeleteRowId(null);
                    }
                }, onConfirm: () => {
                    void confirmDelete();
                }, open: Boolean(deleteRow), pending: Boolean(deleteRow && pendingRowIds.has(deleteRow.id)), pendingLabel: confirmation?.pendingLabel ?? "Deleting…", title: confirmation?.title ?? "Delete row?" })] }));
}
function EditableRowMessages({ error, errorId, messageId, stale, validation, validationId, }) {
    if (!error && !validation && !stale)
        return null;
    return (_jsxs("div", { className: "od-editable-table-messages", id: messageId, children: [validation ? (_jsx("p", { className: "od-editable-table-validation", id: validationId, children: validation })) : null, error ? (_jsx("p", { className: "od-editable-table-error", id: errorId, role: "alert", children: error })) : null, stale ? (_jsx("p", { className: "od-editable-table-stale", children: "Source data changed. Your draft is preserved." })) : null] }));
}
function handleCellKeyDown(event, options) {
    if (event.defaultPrevented || options.locked)
        return;
    if (options.editing && event.key === "Escape") {
        event.preventDefault();
        options.cancel();
        return;
    }
    if (options.editing &&
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        options.save) {
        const target = event.target;
        if (target instanceof HTMLElement &&
            target.closest("button, a, [role='button'], [role='link'], [role='combobox'], [data-editable-table-enter-save='false']")) {
            return;
        }
        event.preventDefault();
        options.save();
        return;
    }
    if (!options.editing && event.key === "Delete" && options.deleteRow) {
        event.preventDefault();
        options.deleteRow();
    }
}
function makeReorder(rows, row, rowIndex, direction, reorder) {
    if (row.isNew ||
        row.locked ||
        row.saving ||
        row.deleting ||
        reorder.isLocked?.(row, rowIndex)) {
        return null;
    }
    const requestedScope = reorder.getScope?.(row, rowIndex);
    if (requestedScope === null)
        return null;
    const scope = requestedScope ?? "";
    const scopedRows = rows.filter((candidate, index) => {
        const candidateScope = reorder.getScope?.(candidate, index);
        return (!candidate.isNew &&
            candidateScope !== null &&
            (candidateScope ?? "") === scope);
    });
    const movableRows = scopedRows.filter((candidate) => {
        const candidateIndex = rows.findIndex((item) => item.id === candidate.id);
        return (candidateIndex >= 0 &&
            !candidate.locked &&
            !candidate.saving &&
            !candidate.deleting &&
            !reorder.isLocked?.(candidate, candidateIndex));
    });
    const movableFromIndex = movableRows.findIndex((candidate) => candidate.id === row.id);
    const target = movableRows[movableFromIndex + direction];
    if (movableFromIndex < 0 || !target)
        return null;
    const fromIndex = scopedRows.findIndex((candidate) => candidate.id === row.id);
    const toIndex = scopedRows.findIndex((candidate) => candidate.id === target.id);
    if (fromIndex < 0 || toIndex < 0)
        return null;
    const orderedRows = [...scopedRows];
    const [moved] = orderedRows.splice(fromIndex, 1);
    if (!moved)
        return null;
    orderedRows.splice(toIndex, 0, moved);
    return {
        row,
        fromIndex,
        toIndex,
        orderedRowIds: orderedRows.map((candidate) => candidate.id),
        orderedRows,
        scope,
    };
}
function closestEditableRow(target) {
    return target instanceof HTMLElement
        ? target.closest("[data-editable-table-row]")
        : null;
}
function closestDataTableRow(target) {
    return target instanceof HTMLElement
        ? target.closest("[data-data-table-row]")
        : null;
}
function focusRowControl(root, rowId) {
    if (!root)
        return false;
    const rows = root.querySelectorAll("[data-data-table-row]");
    for (const row of rows) {
        if (row.dataset.dataTableRow !== rowId || row.getClientRects().length === 0)
            continue;
        const control = row.querySelector("[data-data-table-control]:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)");
        if (control) {
            control.focus();
            return document.activeElement === control;
        }
    }
    return false;
}
function focusInvalidControl(root, rowId) {
    if (!root)
        return;
    const rows = root.querySelectorAll("[data-data-table-row]");
    for (const row of rows) {
        if (row.dataset.dataTableRow !== rowId || row.getClientRects().length === 0)
            continue;
        const control = row.querySelector("[aria-invalid='true']:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)");
        control?.focus();
        return;
    }
}
function focusNearestRowControl(root, rowIds, startIndex) {
    for (let distance = 0; distance < rowIds.length; distance += 1) {
        const after = rowIds[startIndex + distance];
        if (after && focusRowControl(root, after))
            return true;
        if (distance === 0)
            continue;
        const before = rowIds[startIndex - distance];
        if (before && focusRowControl(root, before))
            return true;
    }
    return focusTable(root);
}
function focusTable(root) {
    const table = root?.querySelector(".od-data-table");
    if (!table)
        return false;
    table.focus();
    return document.activeElement === table;
}
function validateEditableTable(ariaLabel, columns, rows, saveMode, onSave, onCreate) {
    if (!ariaLabel.trim())
        throw new TypeError("EditableTable ariaLabel must not be empty.");
    if (columns.length === 0)
        throw new RangeError("EditableTable must have at least one column.");
    const columnKeys = columns.map((column) => column.key);
    if (new Set(columnKeys).size !== columnKeys.length ||
        columnKeys.some((key) => !key.trim())) {
        throw new TypeError("EditableTable column keys must be non-empty and unique.");
    }
    const rowIds = rows.map((row) => row.id);
    if (new Set(rowIds).size !== rowIds.length ||
        rowIds.some((id) => !id.trim())) {
        throw new TypeError("EditableTable row identifiers must be non-empty and unique.");
    }
    if (rows.some((row) => !row.label.trim())) {
        throw new TypeError("EditableTable row labels must not be empty.");
    }
    if (rows.some((row) => row.isNew) && !onCreate) {
        throw new TypeError("EditableTable requires onCreate when it has a new row.");
    }
    if (rows.some((row) => !row.isNew &&
        (Boolean(row.editing) || (saveMode === "batch" && Boolean(row.dirty)))) &&
        !onSave) {
        throw new TypeError("EditableTable requires onSave for editable saved rows.");
    }
}
//# sourceMappingURL=EditableTable.js.map