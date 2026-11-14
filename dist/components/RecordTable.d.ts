import type { ReactNode } from "react";
export interface RecordTableColumn {
    readonly id: string;
    readonly label: string;
    /** Right-align numbers. */
    readonly numeric?: boolean;
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
    readonly className?: string;
}
/** A plain table of records. The first cell of a row opens the record. */
export declare function RecordTable({ className, columns, label, onOpen, rows, }: RecordTableProps): import("react").JSX.Element;
//# sourceMappingURL=RecordTable.d.ts.map