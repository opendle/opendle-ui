import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { type DataTableDensity, type DataTableLoadMore, type DataTableState } from "./DataTable.js";
export type EditableTableSaveMode = "automatic" | "explicit" | "batch";
export interface EditableTableRow<TDraft> {
    readonly id: string;
    readonly label: string;
    readonly draft: TDraft;
    readonly committedDraft?: TDraft;
    readonly editing?: boolean;
    readonly dirty?: boolean;
    readonly isNew?: boolean;
    readonly locked?: boolean;
    readonly saving?: boolean;
    readonly deleting?: boolean;
    readonly validation?: ReactNode;
    readonly error?: ReactNode;
    /** Set when the host has newer source data but must preserve this local draft. */
    readonly stale?: boolean;
}
export interface EditableTableCellContext<TDraft> {
    readonly row: EditableTableRow<TDraft>;
    readonly rowIndex: number;
    readonly disabled: boolean;
    readonly pending: boolean;
    readonly presentation: "desktop" | "phone";
    readonly validation: ReactNode;
    readonly error: ReactNode;
    readonly stale: boolean;
    readonly messageId: string;
    readonly validationId: string;
    readonly errorId: string;
    readonly update: (patch: Partial<TDraft>) => void;
    readonly save: () => void;
    readonly cancel: () => void;
}
export interface EditableTableColumn<TDraft> {
    readonly key: string;
    readonly header: ReactNode;
    readonly phoneLabel?: ReactNode;
    readonly width?: CSSProperties["width"];
    readonly align?: "start" | "center" | "end";
    readonly renderRead: (context: EditableTableCellContext<TDraft>) => ReactNode;
    readonly renderEdit: (context: EditableTableCellContext<TDraft>) => ReactNode;
}
export interface EditableTableDeleteConfirmation<TDraft> {
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly confirmLabel?: ReactNode;
    readonly impactStatement?: string;
    readonly impactLabel?: ReactNode;
    readonly pendingLabel?: ReactNode;
    readonly row: EditableTableRow<TDraft>;
}
export interface EditableTableReorderContext<TDraft> {
    readonly row: EditableTableRow<TDraft>;
    readonly fromIndex: number;
    readonly toIndex: number;
    readonly orderedRowIds: readonly string[];
    readonly orderedRows: readonly EditableTableRow<TDraft>[];
    readonly scope: string;
}
export interface EditableTableReorder<TDraft> {
    readonly onReorder: (context: EditableTableReorderContext<TDraft>) => void | Promise<void>;
    readonly getScope?: (row: EditableTableRow<TDraft>, rowIndex: number) => string | null | undefined;
    readonly isLocked?: (row: EditableTableRow<TDraft>, rowIndex: number) => boolean;
}
export interface EditableTableProps<TDraft> extends Omit<HTMLAttributes<HTMLElement>, "children" | "onError"> {
    readonly ariaLabel: string;
    readonly columns: readonly EditableTableColumn<TDraft>[];
    readonly rows: readonly EditableTableRow<TDraft>[];
    readonly saveMode?: EditableTableSaveMode;
    readonly onDraftChange: (rowId: string, patch: Partial<TDraft>) => void;
    readonly onEdit?: (rowId: string) => void;
    readonly onSave?: (rowId: string, draft: TDraft) => void | Promise<void>;
    readonly onCreate?: (rowId: string, draft: TDraft) => string | undefined | Promise<string | undefined>;
    readonly onCancel?: (rowId: string) => void;
    readonly onDelete?: (rowId: string, row: EditableTableRow<TDraft>) => void | Promise<void>;
    readonly validate?: (row: EditableTableRow<TDraft>, rowIndex: number) => ReactNode;
    readonly getDeleteConfirmation?: (row: EditableTableRow<TDraft>, rowIndex: number) => Omit<EditableTableDeleteConfirmation<TDraft>, "row">;
    readonly reorder?: EditableTableReorder<TDraft>;
    readonly search?: ReactNode;
    readonly filters?: ReactNode;
    readonly toolbarLabel?: string;
    readonly state?: DataTableState;
    readonly liveMessage?: ReactNode;
    readonly loadMore?: DataTableLoadMore;
    readonly density?: DataTableDensity;
    readonly minimumWidth?: CSSProperties["minWidth"];
    readonly maxRows?: number;
    readonly saveLabel?: string;
    readonly cancelLabel?: string;
    readonly editLabel?: string;
    readonly deleteLabel?: string;
}
/** A controlled inline editor that uses DataTable for all record presentation. */
export declare function EditableTable<TDraft>({ ariaLabel, cancelLabel, className, columns, deleteLabel, density, editLabel, filters, getDeleteConfirmation, liveMessage, loadMore, maxRows, minimumWidth, onCancel, onCreate, onDelete, onDraftChange, onEdit, onBlur, onPointerDownCapture, onSave, reorder, rows, saveLabel, saveMode, search, state, toolbarLabel, validate, ...props }: EditableTableProps<TDraft>): import("react").JSX.Element;
//# sourceMappingURL=EditableTable.d.ts.map