import type { CSSProperties, ReactNode } from "react";
export interface RecordTableColumn {
    readonly id: string;
    readonly label: string;
    /** Right-align numbers. */
    readonly numeric?: boolean;
    /**
     * The width of the column. A width on a column gives the table a fixed
     * layout: tables with the same columns and widths align their columns.
     * Columns without a width share the free space.
     */
    readonly width?: CSSProperties["width"];
}
export interface RecordTableRow {
    readonly id: string;
    /** The first cell. It is the button that opens the record. */
    readonly title: ReactNode;
    /** The accessible name of the open action. */
    readonly label: string;
    /** One cell for each column after the first. */
    readonly cells: readonly ReactNode[];
}
export interface RecordTableProps {
    /** The accessible name of the table. */
    readonly label: string;
    /** The first column is the title of the record. */
    readonly columns: readonly RecordTableColumn[];
    readonly rows: readonly RecordTableRow[];
    readonly onOpen?: (id: string) => void;
    /** Below this width, the table scrolls horizontally. */
    readonly minimumWidth?: CSSProperties["minWidth"];
    readonly className?: string;
}
/** A plain table of records. The first cell of a row opens the record. */
export declare function RecordTable({ className, columns, label, minimumWidth, onOpen, rows, }: RecordTableProps): import("react").JSX.Element;
//# sourceMappingURL=RecordTable.d.ts.map