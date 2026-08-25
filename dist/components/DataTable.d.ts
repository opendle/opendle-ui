import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
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
    readonly onChange: (columnKey: string, direction: DataTableSortDirection) => void;
    readonly getLabel?: (columnKey: string, direction: DataTableSortDirection) => string;
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
    readonly onAction: (row: T, rowIndex: number, context: DataTableActionContext) => void | Promise<void>;
}
export interface DataTableActionContext {
    /** The exact visible action button that requested the operation. */
    readonly trigger: HTMLButtonElement;
}
export type DataTableState = {
    readonly kind: "ready";
    readonly message?: ReactNode;
} | {
    readonly kind: "loading";
    readonly message: ReactNode;
} | {
    readonly kind: "empty";
    readonly message: ReactNode;
} | {
    readonly kind: "error";
    readonly message: ReactNode;
    readonly retryLabel?: string;
    readonly retryPending?: boolean;
    readonly onRetry?: () => void | Promise<void>;
} | {
    readonly kind: "unavailable";
    readonly message: ReactNode;
} | {
    readonly kind: "stale";
    readonly message: ReactNode;
};
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
export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLElement>, "children"> {
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
/** A host-neutral table with a semantic desktop view and accessible phone cards. */
export declare function DataTable<T>({ actions, actionsLabel, ariaLabel, className, columns, density, expansion, filters, getRowId, getRowLabel, isRowDisabled, isRowPending, liveMessage, loadMore, maxRows, minimumWidth, onFocusCapture, rows, search, selection, sort, state, toolbarLabel, ...props }: DataTableProps<T>): import("react").JSX.Element;
//# sourceMappingURL=DataTable.d.ts.map