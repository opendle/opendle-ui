import type { CSSProperties, ReactNode } from "react";

import { classes } from "./classes.js";
import { PanelContent } from "./PanelContent.js";

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
export function RecordTable({
  className,
  columns,
  label,
  minimumWidth,
  onOpen,
  rows,
}: RecordTableProps) {
  const fixed = columns.some((column) => column.width !== undefined);
  return (
    <PanelContent
      aria-label={`${label} scrollable table`}
      className={classes("od-record-table", className)}
    >
      <table
        data-layout={fixed ? "fixed" : undefined}
        style={
          minimumWidth === undefined ? undefined : { minWidth: minimumWidth }
        }
      >
        <caption className="od-visually-hidden">{label}</caption>
        {fixed ? (
          <colgroup>
            {columns.map((column) => (
              <col key={column.id} style={{ width: column.width }} />
            ))}
          </colgroup>
        ) : null}
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
    </PanelContent>
  );
}
