import type { ReactNode } from "react";

import { classes } from "./classes.js";

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
export function RecordTable({
  className,
  columns,
  label,
  onOpen,
  rows,
}: RecordTableProps) {
  return (
    <div className={classes("od-record-table", className)}>
      <table>
        <caption className="od-visually-hidden">{label}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                data-numeric={column.numeric === true}
                key={column.id}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                {onOpen === undefined ? (
                  row.title
                ) : (
                  <button
                    aria-label={row.label}
                    onClick={() => {
                      onOpen(row.id);
                    }}
                    type="button"
                  >
                    {row.title}
                  </button>
                )}
              </th>
              {row.cells.map((cell, index) => {
                const column = columns[index + 1];
                return (
                  <td data-numeric={column?.numeric === true} key={column?.id}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
