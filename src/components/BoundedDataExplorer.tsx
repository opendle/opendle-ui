import { useId, type HTMLAttributes, type ReactNode } from "react";

import {
  ONTOLOGY_LABEL_LIMIT,
  ONTOLOGY_PAGE_LIMIT,
  assertBoundedItems,
  assertTextMaximum,
  assertUniqueIdentifiers,
  countOccurrences,
  validateOntologyRecordSummary,
  type OntologyRecordSummary,
} from "../OntologyExplorerContract.js";

export interface BoundedDataExplorerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect" | "title"
> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly items: readonly OntologyRecordSummary[];
  readonly selectedKey?: string;
  readonly onSelect?: (item: OntologyRecordSummary) => void;
  readonly openLabel?: (item: OntologyRecordSummary) => string;
  readonly actions?: ReactNode;
  readonly empty?: ReactNode;
  readonly nextPage?: ReactNode;
}

function validateRecords(items: readonly OntologyRecordSummary[]): void {
  assertBoundedItems("Explorer records", items, ONTOLOGY_PAGE_LIMIT);
  assertUniqueIdentifiers(
    "Explorer record key",
    items.map((item) => item.key),
  );
  for (const item of items) {
    validateOntologyRecordSummary(item);
  }
}

/** A bounded current-record table. The host owns reads, paging, and actions. */
export function BoundedDataExplorer({
  actions,
  className,
  description,
  empty,
  items,
  nextPage,
  onSelect,
  openLabel = (item) => `Open ${item.displayTitle}`,
  selectedKey,
  title,
  ...props
}: BoundedDataExplorerProps) {
  validateRecords(items);
  const titleId = useId();
  const descriptionId = useId();
  return (
    <section
      {...props}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={["od-data-explorer", className].filter(Boolean).join(" ")}
    >
      <header className="od-data-explorer-heading">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description ? <p id={descriptionId}>{description}</p> : null}
        </div>
        {actions ? (
          <div className="od-data-explorer-actions">{actions}</div>
        ) : null}
      </header>
      {items.length === 0 ? (
        <output className="od-data-explorer-empty">{empty}</output>
      ) : (
        <div className="od-data-explorer-table-wrap">
          <table className="od-data-explorer-table">
            <caption className="od-visually-hidden">
              {typeof title === "string" ? title : "Current records"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Kind</th>
                <th scope="col">Type</th>
                <th scope="col">Labels</th>
                <th scope="col">Properties</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr data-selected={item.key === selectedKey} key={item.key}>
                  <th scope="row">
                    {onSelect ? (
                      <button
                        aria-label={openLabel(item)}
                        aria-pressed={item.key === selectedKey}
                        className="od-data-explorer-open"
                        onClick={() => {
                          onSelect(item);
                        }}
                        type="button"
                      >
                        <strong>{item.displayTitle}</strong>
                        <span>{item.key}</span>
                      </button>
                    ) : (
                      <span className="od-data-explorer-record">
                        <strong>{item.displayTitle}</strong>
                        <span>{item.key}</span>
                      </span>
                    )}
                  </th>
                  <td data-label="Kind">{item.kind}</td>
                  <td data-label="Type">
                    <code>{item.type}</code>
                  </td>
                  <td data-label="Labels">
                    <OntologyLabelList labels={item.labels} />
                  </td>
                  <td data-label="Properties">
                    {countOccurrences(item.properties)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {nextPage ? (
        <footer className="od-data-explorer-pagination">{nextPage}</footer>
      ) : null}
    </section>
  );
}

export interface OntologyLabelListProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  "children"
> {
  readonly labels: readonly string[];
  readonly emptyLabel?: ReactNode;
}

/** A bounded list for the plain string labels in the Ontology contract. */
export function OntologyLabelList({
  className,
  emptyLabel = "None",
  labels,
  ...props
}: OntologyLabelListProps) {
  assertBoundedItems("Ontology labels", labels, ONTOLOGY_LABEL_LIMIT);
  assertUniqueIdentifiers("Ontology label", labels);
  for (const label of labels) {
    assertTextMaximum("Ontology label", label, 200);
  }
  return labels.length === 0 ? (
    <span className="od-label-list-empty">{emptyLabel}</span>
  ) : (
    <ul
      {...props}
      className={["od-label-list", className].filter(Boolean).join(" ")}
    >
      {labels.map((label) => (
        <li key={label}>{label}</li>
      ))}
    </ul>
  );
}
