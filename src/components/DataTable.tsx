import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type DataTableDensity = "default" | "compact";
export type DataTableSortDirection = "ascending" | "descending";

export interface DataTableCellContext<T> {
  readonly row: T;
  readonly rowId: string;
  readonly rowIndex: number;
  readonly selected: boolean;
  readonly expanded: boolean;
  readonly disabled: boolean;
  readonly pending: boolean;
  /** Identifies the simultaneous responsive presentation when DataTable renders it. */
  readonly presentation?: "desktop" | "phone";
}

export interface DataTableColumn<T> {
  readonly key: string;
  readonly header: ReactNode;
  readonly phoneLabel?: ReactNode;
  readonly width?: CSSProperties["width"];
  readonly align?: "start" | "center" | "end";
  readonly sortable?: boolean;
  readonly render: (context: DataTableCellContext<T>) => ReactNode;
}

export interface DataTableSort {
  readonly columnKey: string | null;
  readonly direction: DataTableSortDirection;
  readonly onChange: (
    columnKey: string,
    direction: DataTableSortDirection,
  ) => void;
  readonly getLabel?: (
    columnKey: string,
    direction: DataTableSortDirection,
  ) => string;
}

export interface DataTableSelection<T> {
  readonly mode?: "single" | "multiple";
  readonly selectedRowIds: readonly string[];
  readonly onChange: (selectedRowIds: readonly string[]) => void;
  readonly getLabel?: (row: T, rowIndex: number) => string;
  readonly selectAllLabel?: string;
}

export interface DataTableExpansion<T> {
  readonly expandedRowIds: readonly string[];
  readonly onChange: (expandedRowIds: readonly string[]) => void;
  readonly detail: (context: DataTableCellContext<T>) => ReactNode;
  readonly getLabel?: (row: T, rowIndex: number, expanded: boolean) => string;
}

export interface DataTableAction<T> {
  readonly key: string;
  readonly label: (row: T, rowIndex: number) => string;
  readonly pendingLabel?: (row: T, rowIndex: number) => string;
  readonly disabled?: (row: T, rowIndex: number) => boolean;
  readonly pending?: (row: T, rowIndex: number) => boolean;
  readonly onAction: (row: T, rowIndex: number) => void | Promise<void>;
}

export type DataTableState =
  | { readonly kind: "ready"; readonly message?: ReactNode }
  | { readonly kind: "loading"; readonly message: ReactNode }
  | { readonly kind: "empty"; readonly message: ReactNode }
  | {
      readonly kind: "error";
      readonly message: ReactNode;
      readonly retryLabel?: string;
      readonly retryPending?: boolean;
      readonly onRetry?: () => void | Promise<void>;
    }
  | { readonly kind: "unavailable"; readonly message: ReactNode }
  | { readonly kind: "stale"; readonly message: ReactNode };

export interface DataTableLoadMore {
  readonly hasMore: boolean;
  readonly loading?: boolean;
  readonly error?: ReactNode;
  readonly loadedLabel?: ReactNode;
  readonly loadLabel?: string;
  readonly loadingLabel?: string;
  readonly retryLabel?: string;
  readonly completeLabel?: ReactNode;
  readonly onLoadMore?: () => void | Promise<void>;
  readonly onRetry?: () => void | Promise<void>;
}

export interface DataTableProps<T> extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly ariaLabel: string;
  readonly columns: readonly DataTableColumn<T>[];
  readonly rows: readonly T[];
  readonly getRowId: (row: T, rowIndex: number) => string;
  readonly getRowLabel: (row: T, rowIndex: number) => string;
  readonly search?: ReactNode;
  readonly filters?: ReactNode;
  readonly toolbarLabel?: string;
  readonly state?: DataTableState;
  readonly liveMessage?: ReactNode;
  readonly loadMore?: DataTableLoadMore;
  readonly sort?: DataTableSort;
  readonly selection?: DataTableSelection<T>;
  readonly expansion?: DataTableExpansion<T>;
  readonly actions?: readonly DataTableAction<T>[];
  readonly actionsLabel?: string;
  readonly density?: DataTableDensity;
  readonly minimumWidth?: CSSProperties["minWidth"];
  readonly maxRows?: number;
  readonly isRowDisabled?: (row: T, rowIndex: number) => boolean;
  readonly isRowPending?: (row: T, rowIndex: number) => boolean;
}

interface FocusSnapshot {
  readonly rowIndex: number;
  readonly control: string;
}

const DEFAULT_MAX_ROWS = 200;
const EMPTY_ACTIONS: readonly never[] = [];

/** A host-neutral table with a semantic desktop view and accessible phone cards. */
export function DataTable<T>({
  actions = EMPTY_ACTIONS,
  actionsLabel = "Actions",
  ariaLabel,
  className,
  columns,
  density = "default",
  expansion,
  filters,
  getRowId,
  getRowLabel,
  isRowDisabled = () => false,
  isRowPending = () => false,
  liveMessage,
  loadMore,
  maxRows = DEFAULT_MAX_ROWS,
  minimumWidth = "40rem",
  onFocusCapture,
  rows,
  search,
  selection,
  sort,
  state,
  toolbarLabel,
  ...props
}: DataTableProps<T>) {
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
  const { captureFocus, rootRef } = useDataTableFocus(rowIds);
  const actionLocksRef = useRef(new Set<string>());
  const loadLockRef = useRef(false);
  const mountedRef = useRef(true);
  const [localPendingActions, setLocalPendingActions] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [localLoadPending, setLocalLoadPending] = useState(false);
  const selectedIds = new Set(selection?.selectedRowIds ?? []);
  const expandedIds = new Set(expansion?.expandedRowIds ?? []);
  const selectionMode = selection?.mode ?? "multiple";
  const leadingColumnCount =
    Number(Boolean(selection)) + Number(Boolean(expansion));
  const totalColumnCount =
    leadingColumnCount + columns.length + Number(actions.length > 0);
  const effectiveState: DataTableState =
    state ??
    (rows.length === 0
      ? { kind: "empty", message: "No rows are available." }
      : { kind: "ready" });
  const showRows =
    rows.length > 0 &&
    effectiveState.kind !== "empty" &&
    !(effectiveState.kind === "loading" && rows.length === 0);
  const tableBusy =
    effectiveState.kind === "loading" ||
    Boolean(loadMore?.loading) ||
    localLoadPending;
  const boundedLoadMore =
    loadMore && rows.length >= maxRows
      ? {
          completeLabel: loadMore.completeLabel ?? "The row limit is loaded",
          hasMore: false,
          loadedLabel: loadMore.loadedLabel,
        }
      : loadMore;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runAction = (
    action: DataTableAction<T>,
    row: T,
    rowIndex: number,
    rowId: string,
  ) => {
    const lockKey = actionLockKey(rowId, action.key);
    if (actionLocksRef.current.has(lockKey)) return;
    actionLocksRef.current.add(lockKey);
    setLocalPendingActions((current) => new Set(current).add(lockKey));
    let result: void | Promise<void>;
    try {
      result = action.onAction(row, rowIndex);
    } catch {
      releaseActionLock(
        lockKey,
        actionLocksRef,
        mountedRef,
        setLocalPendingActions,
      );
      return;
    }
    void Promise.resolve(result).then(
      () => {
        releaseActionLock(
          lockKey,
          actionLocksRef,
          mountedRef,
          setLocalPendingActions,
        );
      },
      () => {
        releaseActionLock(
          lockKey,
          actionLocksRef,
          mountedRef,
          setLocalPendingActions,
        );
      },
    );
  };

  const runLoadAction = (action: (() => void | Promise<void>) | undefined) => {
    if (!action || loadLockRef.current || loadMore?.loading) return;
    loadLockRef.current = true;
    setLocalLoadPending(true);
    let result: void | Promise<void>;
    try {
      result = action();
    } catch {
      releaseLoadLock(loadLockRef, mountedRef, setLocalLoadPending);
      return;
    }
    void Promise.resolve(result).then(
      () => {
        releaseLoadLock(loadLockRef, mountedRef, setLocalLoadPending);
      },
      () => {
        releaseLoadLock(loadLockRef, mountedRef, setLocalLoadPending);
      },
    );
  };

  const renderContext = (
    row: T,
    rowIndex: number,
    presentation: NonNullable<DataTableCellContext<T>["presentation"]>,
  ): DataTableCellContext<T> => {
    const rowId = rowIds[rowIndex] ?? "";
    return {
      row,
      rowId,
      rowIndex,
      selected: selectedIds.has(rowId),
      expanded: expandedIds.has(rowId),
      disabled: isRowDisabled(row, rowIndex),
      pending: isRowPending(row, rowIndex),
      presentation,
    };
  };

  const setSelection = (row: T, rowIndex: number, selected: boolean) => {
    if (!selection) return;
    const rowId = rowIds[rowIndex] ?? "";
    if (selectionMode === "single") {
      selection.onChange(selected ? [rowId] : []);
      return;
    }
    const next = new Set(selection.selectedRowIds);
    if (selected) next.add(rowId);
    else next.delete(rowId);
    selection.onChange([...next]);
  };

  const setExpanded = (rowId: string, expanded: boolean) => {
    if (!expansion) return;
    const next = new Set(expansion.expandedRowIds);
    if (expanded) next.add(rowId);
    else next.delete(rowId);
    expansion.onChange([...next]);
  };

  const eligibleRowIds = rows.flatMap((row, rowIndex) =>
    isRowDisabled(row, rowIndex) || isRowPending(row, rowIndex)
      ? []
      : [rowIds[rowIndex] ?? ""],
  );
  const selectedEligibleCount = eligibleRowIds.filter((rowId) =>
    selectedIds.has(rowId),
  ).length;

  return (
    <section
      {...props}
      aria-label={ariaLabel}
      aria-busy={tableBusy || undefined}
      className={[
        "od-data-table",
        `od-data-table-density-${density}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
      tabIndex={props.tabIndex ?? -1}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        captureFocus(event.target);
      }}
    >
      {search || filters ? (
        <search
          aria-label={labelOrFallback(
            toolbarLabel,
            `${ariaLabel} search and filters`,
          )}
          className="od-data-table-toolbar"
        >
          {search ? <div className="od-data-table-search">{search}</div> : null}
          {filters ? (
            <div className="od-data-table-filters">{filters}</div>
          ) : null}
        </search>
      ) : null}

      <DataTableStateBanner
        hasRows={rows.length > 0}
        localRetryPending={localLoadPending}
        onRetry={() => {
          if (effectiveState.kind === "error") {
            runLoadAction(effectiveState.onRetry);
          }
        }}
        state={effectiveState}
      />

      {showRows ? (
        <DataTableContent
          actions={actions}
          actionsLabel={actionsLabel}
          ariaLabel={ariaLabel}
          columns={columns}
          eligibleRowIds={eligibleRowIds}
          expansion={expansion}
          localPendingActions={localPendingActions}
          minimumWidth={minimumWidth}
          onAction={runAction}
          onExpand={setExpanded}
          onSelect={setSelection}
          renderContext={renderContext}
          rowLabels={rowLabels}
          rows={rows}
          selectedEligibleCount={selectedEligibleCount}
          selection={selection}
          selectionMode={selectionMode}
          sort={sort}
          tableBusy={tableBusy}
          tableId={tableId}
          totalColumnCount={totalColumnCount}
        />
      ) : null}

      <DataTableLoadMoreControl
        ariaLabel={ariaLabel}
        loadMore={boundedLoadMore}
        localPending={localLoadPending}
        rowCount={rows.length}
        runAction={runLoadAction}
      />
      <output aria-live="polite" className="od-visually-hidden">
        {liveMessage ??
          `${String(rows.length)} ${rows.length === 1 ? "row" : "rows"} loaded.`}
      </output>
    </section>
  );
}

function useDataTableFocus(rowIds: readonly string[]) {
  const rootRef = useRef<HTMLElement | null>(null);
  const focusSnapshotRef = useRef<FocusSnapshot | null>(null);
  const rowSignature = JSON.stringify(rowIds);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const snapshot = focusSnapshotRef.current;
    if (!root || !snapshot || typeof document === "undefined") return;
    if (root.contains(document.activeElement)) return;
    if (
      document.activeElement !== null &&
      document.activeElement !== document.body
    ) {
      return;
    }
    const currentRowIds = JSON.parse(rowSignature) as string[];
    const replacementId =
      currentRowIds[Math.min(snapshot.rowIndex, currentRowIds.length - 1)];
    const target = replacementId
      ? (findVisibleControl(root, replacementId, snapshot.control) ??
        findVisibleFallback(root))
      : findVisibleFallback(root);
    target?.focus();
  }, [rowSignature]);

  const captureFocus = (target: EventTarget) => {
    if (!(target instanceof HTMLElement)) return;
    const rowElement = target.closest<HTMLElement>("[data-data-table-row]");
    const controlElement = target.closest<HTMLElement>(
      "[data-data-table-control]",
    );
    if (!rowElement || !controlElement) {
      focusSnapshotRef.current = null;
      return;
    }
    const rowId = rowElement.dataset.dataTableRow;
    const control = controlElement.dataset.dataTableControl;
    const rowIndex = rowId ? rowIds.indexOf(rowId) : -1;
    if (control && rowIndex >= 0) {
      focusSnapshotRef.current = { rowIndex, control };
    }
  };

  return { captureFocus, rootRef };
}

function DataTableContent<T>({
  actions,
  actionsLabel,
  ariaLabel,
  columns,
  eligibleRowIds,
  expansion,
  localPendingActions,
  minimumWidth,
  onAction,
  onExpand,
  onSelect,
  renderContext,
  rowLabels,
  rows,
  selectedEligibleCount,
  selection,
  selectionMode,
  sort,
  tableBusy,
  tableId,
  totalColumnCount,
}: {
  readonly actions: readonly DataTableAction<T>[];
  readonly actionsLabel: string;
  readonly ariaLabel: string;
  readonly columns: readonly DataTableColumn<T>[];
  readonly eligibleRowIds: readonly string[];
  readonly expansion: DataTableExpansion<T> | undefined;
  readonly localPendingActions: ReadonlySet<string>;
  readonly minimumWidth: CSSProperties["minWidth"];
  readonly onAction: (
    action: DataTableAction<T>,
    row: T,
    rowIndex: number,
    rowId: string,
  ) => void;
  readonly onExpand: (rowId: string, expanded: boolean) => void;
  readonly onSelect: (row: T, rowIndex: number, selected: boolean) => void;
  readonly renderContext: (
    row: T,
    rowIndex: number,
    presentation: NonNullable<DataTableCellContext<T>["presentation"]>,
  ) => DataTableCellContext<T>;
  readonly rowLabels: readonly string[];
  readonly rows: readonly T[];
  readonly selectedEligibleCount: number;
  readonly selection: DataTableSelection<T> | undefined;
  readonly selectionMode: "single" | "multiple";
  readonly sort: DataTableSort | undefined;
  readonly tableBusy: boolean;
  readonly tableId: string;
  readonly totalColumnCount: number;
}) {
  const scrollRef = useRef<HTMLElement | null>(null);
  return (
    <>
      <div className="od-data-table-scroll-controls">
        <button
          aria-label={`Scroll ${ariaLabel} left`}
          onClick={() => {
            scrollRef.current?.scrollBy({ behavior: "smooth", left: -320 });
          }}
          type="button"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          aria-label={`Scroll ${ariaLabel} right`}
          onClick={() => {
            scrollRef.current?.scrollBy({ behavior: "smooth", left: 320 });
          }}
          type="button"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      {/* A tab stop lets keyboard users scroll the labelled overflow viewport. */}
      {/* react-doctor-disable-next-line react-doctor/no-noninteractive-tabindex */}
      <section
        aria-label={`${ariaLabel} scrollable table`}
        className="od-data-table-desktop"
        ref={scrollRef}
        tabIndex={0}
      >
        <table
          aria-busy={tableBusy || undefined}
          className="od-data-table-table"
          style={{ minWidth: minimumWidth }}
        >
          <caption className="od-visually-hidden">{ariaLabel}</caption>
          <colgroup>
            {selection ? (
              <col className="od-data-table-selection-column" />
            ) : null}
            {expansion ? (
              <col className="od-data-table-expansion-column" />
            ) : null}
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
            {actions.length > 0 ? (
              <col className="od-data-table-actions-column" />
            ) : null}
          </colgroup>
          <thead>
            <tr>
              {selection ? (
                <th className="od-data-table-control-heading" scope="col">
                  {selectionMode === "multiple" ? (
                    <SelectAllControl
                      allSelected={
                        eligibleRowIds.length > 0 &&
                        selectedEligibleCount === eligibleRowIds.length
                      }
                      disabled={eligibleRowIds.length === 0 || tableBusy}
                      indeterminate={
                        selectedEligibleCount > 0 &&
                        selectedEligibleCount < eligibleRowIds.length
                      }
                      label={labelOrFallback(
                        selection.selectAllLabel,
                        "Select all visible rows",
                      )}
                      onChange={(checked) => {
                        const next = new Set(selection.selectedRowIds);
                        for (const rowId of eligibleRowIds) {
                          if (checked) next.add(rowId);
                          else next.delete(rowId);
                        }
                        selection.onChange([...next]);
                      }}
                    />
                  ) : (
                    <span className="od-visually-hidden">Select</span>
                  )}
                </th>
              ) : null}
              {expansion ? (
                <th className="od-data-table-control-heading" scope="col">
                  <span className="od-visually-hidden">Details</span>
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  aria-sort={
                    column.sortable && sort
                      ? sort.columnKey === column.key
                        ? sort.direction
                        : "none"
                      : undefined
                  }
                  className={`od-data-table-align-${column.align ?? "start"}`}
                  key={column.key}
                  scope="col"
                >
                  {column.sortable && sort ? (
                    <SortControl column={column} sort={sort} />
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {actions.length > 0 ? (
                <th className="od-data-table-actions-heading" scope="col">
                  {actionsLabel}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const context = renderContext(row, rowIndex, "desktop");
              return (
                <TableRows
                  actions={actions}
                  actionsLabel={actionsLabel}
                  columns={columns}
                  context={context}
                  expansion={expansion}
                  key={context.rowId}
                  localPendingActions={localPendingActions}
                  onAction={onAction}
                  onExpand={onExpand}
                  onSelect={onSelect}
                  rowLabel={rowLabels[rowIndex] ?? ""}
                  selection={selection}
                  selectionName={`${tableId}-desktop-selection`}
                  selectionMode={selectionMode}
                  tableId={tableId}
                  totalColumnCount={totalColumnCount}
                />
              );
            })}
          </tbody>
        </table>
      </section>

      <ul aria-label={`${ariaLabel} cards`} className="od-data-table-cards">
        {rows.map((row, rowIndex) => {
          const context = renderContext(row, rowIndex, "phone");
          return (
            <PhoneCard
              actions={actions}
              actionsLabel={actionsLabel}
              columns={columns}
              context={context}
              expansion={expansion}
              key={context.rowId}
              localPendingActions={localPendingActions}
              onAction={onAction}
              onExpand={onExpand}
              onSelect={onSelect}
              rowLabel={rowLabels[rowIndex] ?? ""}
              selection={selection}
              selectionName={`${tableId}-card-selection`}
              selectionMode={selectionMode}
              tableId={tableId}
            />
          );
        })}
      </ul>
    </>
  );
}

function TableRows<T>({
  actions,
  actionsLabel,
  columns,
  context,
  expansion,
  localPendingActions,
  onAction,
  onExpand,
  onSelect,
  rowLabel,
  selection,
  selectionName,
  selectionMode,
  tableId,
  totalColumnCount,
}: {
  readonly actions: readonly DataTableAction<T>[];
  readonly actionsLabel: string;
  readonly columns: readonly DataTableColumn<T>[];
  readonly context: DataTableCellContext<T>;
  readonly expansion: DataTableExpansion<T> | undefined;
  readonly localPendingActions: ReadonlySet<string>;
  readonly onAction: (
    action: DataTableAction<T>,
    row: T,
    rowIndex: number,
    rowId: string,
  ) => void;
  readonly onExpand: (rowId: string, expanded: boolean) => void;
  readonly onSelect: (row: T, rowIndex: number, selected: boolean) => void;
  readonly rowLabel: string;
  readonly selection: DataTableSelection<T> | undefined;
  readonly selectionName: string;
  readonly selectionMode: "single" | "multiple";
  readonly tableId: string;
  readonly totalColumnCount: number;
}) {
  const detailId = `${tableId}-desktop-${String(context.rowIndex)}-detail`;
  return (
    <>
      <tr
        aria-disabled={context.disabled || undefined}
        aria-busy={context.pending || undefined}
        data-data-table-row={context.rowId}
        data-expanded={context.expanded || undefined}
        data-selected={context.selected || undefined}
      >
        {selection ? (
          <td className="od-data-table-control-cell">
            <SelectionControl
              context={context}
              label={labelOrFallback(
                selection.getLabel?.(context.row, context.rowIndex),
                `Select ${rowLabel}`,
              )}
              mode={selectionMode}
              name={selectionName}
              onChange={onSelect}
            />
          </td>
        ) : null}
        {expansion ? (
          <td className="od-data-table-control-cell">
            <ExpansionControl
              context={context}
              detailId={detailId}
              expansion={expansion}
              onChange={onExpand}
              rowLabel={rowLabel}
            />
          </td>
        ) : null}
        {columns.map((column) => (
          <td
            className={`od-data-table-cell od-data-table-align-${column.align ?? "start"}`}
            key={column.key}
          >
            {column.render(context)}
          </td>
        ))}
        {actions.length > 0 ? (
          <td className="od-data-table-actions-cell">
            <ActionControls
              actions={actions}
              context={context}
              label={actionsLabel}
              localPendingActions={localPendingActions}
              onAction={onAction}
              rowLabel={rowLabel}
            />
          </td>
        ) : null}
      </tr>
      {expansion && context.expanded ? (
        <tr className="od-data-table-detail-row">
          <td colSpan={totalColumnCount}>
            <div className="od-data-table-detail" id={detailId}>
              {expansion.detail(context)}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function PhoneCard<T>({
  actions,
  actionsLabel,
  columns,
  context,
  expansion,
  localPendingActions,
  onAction,
  onExpand,
  onSelect,
  rowLabel,
  selection,
  selectionName,
  selectionMode,
  tableId,
}: Omit<Parameters<typeof TableRows<T>>[0], "totalColumnCount">) {
  const rowDomId = String(context.rowIndex);
  const headingId = `${tableId}-card-${rowDomId}-heading`;
  const detailId = `${tableId}-card-${rowDomId}-detail`;
  const disabledDescriptionId = `${tableId}-card-${rowDomId}-disabled`;
  return (
    <li
      aria-busy={context.pending || undefined}
      className="od-data-table-card"
      data-data-table-row={context.rowId}
      data-disabled={context.disabled || undefined}
      data-expanded={context.expanded || undefined}
      data-selected={context.selected || undefined}
    >
      <article
        aria-describedby={context.disabled ? disabledDescriptionId : undefined}
        aria-labelledby={headingId}
      >
        {context.disabled ? (
          <span className="od-visually-hidden" id={disabledDescriptionId}>
            {rowLabel} is disabled.
          </span>
        ) : null}
        <header className="od-data-table-card-heading">
          <strong className="od-data-table-card-title" id={headingId}>
            {rowLabel}
          </strong>
          <div className="od-data-table-card-controls">
            {selection ? (
              <SelectionControl
                context={context}
                label={labelOrFallback(
                  selection.getLabel?.(context.row, context.rowIndex),
                  `Select ${rowLabel}`,
                )}
                mode={selectionMode}
                name={selectionName}
                onChange={onSelect}
              />
            ) : null}
            {expansion ? (
              <ExpansionControl
                context={context}
                detailId={detailId}
                expansion={expansion}
                onChange={onExpand}
                rowLabel={rowLabel}
              />
            ) : null}
          </div>
        </header>
        <dl className="od-data-table-card-values">
          {columns.map((column) => (
            <div className="od-data-table-card-value" key={column.key}>
              <dt>{column.phoneLabel ?? column.header}</dt>
              <dd className={`od-data-table-align-${column.align ?? "start"}`}>
                {column.render(context)}
              </dd>
            </div>
          ))}
        </dl>
        {expansion && context.expanded ? (
          <div className="od-data-table-detail" id={detailId}>
            {expansion.detail(context)}
          </div>
        ) : null}
        {actions.length > 0 ? (
          <footer className="od-data-table-card-actions">
            <ActionControls
              actions={actions}
              context={context}
              label={actionsLabel}
              localPendingActions={localPendingActions}
              onAction={onAction}
              rowLabel={rowLabel}
            />
          </footer>
        ) : null}
      </article>
    </li>
  );
}

function SortControl<T>({
  column,
  sort,
}: {
  readonly column: DataTableColumn<T>;
  readonly sort: DataTableSort;
}) {
  const nextDirection: DataTableSortDirection =
    sort.columnKey === column.key && sort.direction === "ascending"
      ? "descending"
      : "ascending";
  const fallbackLabel = `Sort by ${plainText(column.header) ?? column.key} ${nextDirection}`;
  return (
    <button
      aria-label={labelOrFallback(
        sort.getLabel?.(column.key, nextDirection),
        fallbackLabel,
      )}
      className="od-data-table-sort-control"
      onClick={() => {
        sort.onChange(column.key, nextDirection);
      }}
      type="button"
    >
      <span>{column.header}</span>
      <span aria-hidden="true" className="od-data-table-sort-indicator">
        {sort.columnKey === column.key
          ? sort.direction === "ascending"
            ? "↑"
            : "↓"
          : "↕"}
      </span>
    </button>
  );
}

function SelectAllControl({
  allSelected,
  disabled,
  indeterminate,
  label,
  onChange,
}: {
  readonly allSelected: boolean;
  readonly disabled: boolean;
  readonly indeterminate: boolean;
  readonly label: string;
  readonly onChange: (checked: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      aria-label={label}
      checked={allSelected}
      className="od-data-table-selection-control"
      data-data-table-control="select-all"
      disabled={disabled}
      onChange={(event) => {
        onChange(event.currentTarget.checked);
      }}
      ref={inputRef}
      type="checkbox"
    />
  );
}

function SelectionControl<T>({
  context,
  label,
  mode,
  name,
  onChange,
}: {
  readonly context: DataTableCellContext<T>;
  readonly label: string;
  readonly mode: "single" | "multiple";
  readonly name: string;
  readonly onChange: (row: T, rowIndex: number, selected: boolean) => void;
}) {
  return (
    <input
      aria-label={label}
      checked={context.selected}
      className="od-data-table-selection-control"
      data-data-table-control="selection"
      disabled={context.disabled || context.pending}
      name={mode === "single" ? name : undefined}
      onChange={(event) => {
        onChange(context.row, context.rowIndex, event.currentTarget.checked);
      }}
      type={mode === "single" ? "radio" : "checkbox"}
    />
  );
}

function ExpansionControl<T>({
  context,
  detailId,
  expansion,
  onChange,
  rowLabel,
}: {
  readonly context: DataTableCellContext<T>;
  readonly detailId: string;
  readonly expansion: DataTableExpansion<T>;
  readonly onChange: (rowId: string, expanded: boolean) => void;
  readonly rowLabel: string;
}) {
  const fallbackLabel = `${context.expanded ? "Hide" : "Show"} details for ${rowLabel}`;
  return (
    <button
      aria-controls={context.expanded ? detailId : undefined}
      aria-expanded={context.expanded}
      aria-label={labelOrFallback(
        expansion.getLabel?.(context.row, context.rowIndex, context.expanded),
        fallbackLabel,
      )}
      className="od-data-table-expansion-control"
      data-data-table-control="expansion"
      disabled={context.disabled || context.pending}
      onClick={() => {
        onChange(context.rowId, !context.expanded);
      }}
      type="button"
    >
      <span aria-hidden="true">{context.expanded ? "−" : "+"}</span>
    </button>
  );
}

function ActionControls<T>({
  actions,
  context,
  label,
  localPendingActions,
  onAction,
  rowLabel,
}: {
  readonly actions: readonly DataTableAction<T>[];
  readonly context: DataTableCellContext<T>;
  readonly label: string;
  readonly localPendingActions: ReadonlySet<string>;
  readonly onAction: (
    action: DataTableAction<T>,
    row: T,
    rowIndex: number,
    rowId: string,
  ) => void;
  readonly rowLabel: string;
}) {
  return (
    <fieldset className="od-data-table-actions">
      <legend className="od-visually-hidden">
        {label} for {rowLabel}
      </legend>
      {actions.map((action) => {
        const lockKey = actionLockKey(context.rowId, action.key);
        const actionPending =
          context.pending ||
          Boolean(action.pending?.(context.row, context.rowIndex)) ||
          localPendingActions.has(lockKey);
        const disabled =
          context.disabled ||
          actionPending ||
          Boolean(action.disabled?.(context.row, context.rowIndex));
        const labelText = labelOrFallback(
          actionPending
            ? (action.pendingLabel?.(context.row, context.rowIndex) ??
                action.label(context.row, context.rowIndex))
            : action.label(context.row, context.rowIndex),
          `Action ${action.key} for ${rowLabel}`,
        );
        return (
          <button
            aria-busy={actionPending || undefined}
            className="od-data-table-action"
            data-data-table-control={`action:${action.key}`}
            disabled={disabled}
            key={action.key}
            onClick={() => {
              onAction(action, context.row, context.rowIndex, context.rowId);
            }}
            type="button"
          >
            {labelText}
          </button>
        );
      })}
    </fieldset>
  );
}

function DataTableStateBanner({
  hasRows,
  localRetryPending,
  onRetry,
  state,
}: {
  readonly hasRows: boolean;
  readonly localRetryPending: boolean;
  readonly onRetry: () => void;
  readonly state: DataTableState;
}) {
  if (state.kind === "ready" && state.message === undefined) return null;
  if (hasRows && state.kind === "loading") {
    return (
      <output
        aria-live="polite"
        className="od-data-table-state od-data-table-state-loading"
      >
        {state.message}
      </output>
    );
  }
  if (state.kind === "error") {
    const pending = Boolean(state.retryPending) || localRetryPending;
    return (
      <div
        className="od-data-table-state od-data-table-state-error"
        role="alert"
      >
        <div>{state.message}</div>
        {state.onRetry ? (
          <button
            aria-busy={pending || undefined}
            data-data-table-fallback="true"
            disabled={pending}
            onClick={() => {
              onRetry();
            }}
            type="button"
          >
            {pending ? "Retrying…" : labelOrFallback(state.retryLabel, "Retry")}
          </button>
        ) : null}
      </div>
    );
  }
  if (state.kind === "stale") {
    return (
      <output className="od-data-table-state od-data-table-state-stale">
        {state.message}
      </output>
    );
  }
  if (state.kind === "ready") {
    return <output className="od-data-table-state">{state.message}</output>;
  }
  return (
    <output
      aria-busy={state.kind === "loading" || undefined}
      aria-live="polite"
      className={`od-data-table-state od-data-table-state-${state.kind}`}
    >
      {state.message}
    </output>
  );
}

function DataTableLoadMoreControl({
  ariaLabel,
  loadMore,
  localPending,
  rowCount,
  runAction,
}: {
  readonly ariaLabel: string;
  readonly loadMore: DataTableLoadMore | undefined;
  readonly localPending: boolean;
  readonly rowCount: number;
  readonly runAction: (
    action: (() => void | Promise<void>) | undefined,
  ) => void;
}) {
  if (!loadMore) return null;
  const pending = Boolean(loadMore.loading) || localPending;
  const loadedLabel = loadMore.loadedLabel ?? `${String(rowCount)} loaded`;
  if (loadMore.error) {
    return (
      <section
        aria-label={`${ariaLabel} row loading error`}
        className="od-data-table-load-more"
      >
        <output aria-live="assertive">{loadMore.error}</output>
        <span>{loadedLabel}</span>
        {loadMore.onRetry ? (
          <button
            aria-busy={pending || undefined}
            data-data-table-fallback="true"
            disabled={pending}
            onClick={() => {
              runAction(loadMore.onRetry);
            }}
            type="button"
          >
            {pending
              ? labelOrFallback(loadMore.loadingLabel, "Loading rows…")
              : labelOrFallback(loadMore.retryLabel, "Retry loading rows")}
          </button>
        ) : null}
      </section>
    );
  }
  if (!loadMore.hasMore) {
    return (
      <output className="od-data-table-load-more" aria-live="polite">
        <span>{loadMore.completeLabel ?? "All rows loaded"}</span>
        <span>{loadedLabel}</span>
      </output>
    );
  }
  return (
    <section
      aria-label={`${ariaLabel} load more rows`}
      className="od-data-table-load-more"
    >
      <button
        aria-busy={pending || undefined}
        data-data-table-fallback="true"
        disabled={pending || !loadMore.onLoadMore}
        onClick={() => {
          runAction(loadMore.onLoadMore);
        }}
        type="button"
      >
        {pending
          ? labelOrFallback(loadMore.loadingLabel, "Loading rows…")
          : labelOrFallback(loadMore.loadLabel, "Load more rows")}
      </button>
      <span>{loadedLabel}</span>
    </section>
  );
}

function validateDataTable<T>({
  actions,
  actionsLabel,
  ariaLabel,
  columns,
  maxRows,
  rowIds,
  rowLabels,
  rows,
}: {
  readonly actions: readonly DataTableAction<T>[];
  readonly actionsLabel: string;
  readonly ariaLabel: string;
  readonly columns: readonly DataTableColumn<T>[];
  readonly maxRows: number;
  readonly rowIds: readonly string[];
  readonly rowLabels: readonly string[];
  readonly rows: readonly T[];
}) {
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
  assertUniqueNonEmptyValues(
    "action key",
    actions.map((action) => action.key),
  );
  if (actions.length > 0 && !actionsLabel.trim()) {
    throw new TypeError("DataTable actionsLabel must not be empty.");
  }
}

function assertUniqueNonEmptyValues(name: string, values: readonly string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value.trim())
      throw new TypeError(`DataTable ${name} must not be empty.`);
    if (seen.has(value))
      throw new TypeError(`DataTable has duplicate ${name}s.`);
    seen.add(value);
  }
}

function assertNonEmptyValues(name: string, values: readonly string[]) {
  for (const value of values) {
    if (!value.trim()) {
      throw new TypeError(`DataTable ${name} must not be empty.`);
    }
  }
}

function plainText(value: ReactNode): string | null {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : null;
}

function labelOrFallback(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

function actionLockKey(rowId: string, actionKey: string): string {
  return JSON.stringify([rowId, actionKey]);
}

function releaseLoadLock(
  lockRef: React.RefObject<boolean>,
  mountedRef: React.RefObject<boolean>,
  setPending: React.Dispatch<React.SetStateAction<boolean>>,
) {
  lockRef.current = false;
  if (mountedRef.current) setPending(false);
}

function releaseActionLock(
  lockKey: string,
  lockRef: React.RefObject<Set<string>>,
  mountedRef: React.RefObject<boolean>,
  setPending: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>,
) {
  lockRef.current.delete(lockKey);
  if (!mountedRef.current) return;
  setPending((current) => {
    const next = new Set(current);
    next.delete(lockKey);
    return next;
  });
}

function findVisibleControl(
  root: HTMLElement,
  rowId: string,
  control: string,
): HTMLElement | null {
  const candidates = root.querySelectorAll<HTMLElement>(
    "[data-data-table-row] [data-data-table-control]",
  );
  for (const candidate of candidates) {
    const row = candidate.closest<HTMLElement>("[data-data-table-row]");
    if (
      row?.dataset.dataTableRow === rowId &&
      candidate.dataset.dataTableControl === control &&
      candidate.getClientRects().length > 0 &&
      !candidate.matches(":disabled")
    ) {
      return candidate;
    }
  }
  return null;
}

function findVisibleFallback(root: HTMLElement): HTMLElement | null {
  const candidates = root.querySelectorAll<HTMLElement>(
    "[data-data-table-fallback], .od-data-table-desktop",
  );
  for (const candidate of candidates) {
    if (
      candidate.getClientRects().length > 0 &&
      !candidate.matches(":disabled")
    ) {
      return candidate;
    }
  }
  return root.getClientRects().length > 0 ? root : null;
}
