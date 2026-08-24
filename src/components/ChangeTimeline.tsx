import { useId, type HTMLAttributes, type ReactNode } from "react";

import {
  ONTOLOGY_PAGE_LIMIT,
  assertBoundedItems,
  assertIdentifier,
  assertTextMaximum,
  assertUniqueIdentifiers,
  validateOntologyMetadataBag,
  validateOntologyRecordSummary,
  type OntologyMetadataBag,
  type OntologyRecordSummary,
} from "../OntologyExplorerContract.js";
import { OntologyLabelList } from "./BoundedDataExplorer.js";

export type OntologyChangeItem =
  | { readonly kind: "object" | "link"; readonly record: OntologyRecordSummary }
  | { readonly kind: "metadata_bag"; readonly bag: OntologyMetadataBag };

export interface ChangeTimelineProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect" | "title"
> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly items: readonly OntologyChangeItem[];
  readonly onSelect?: (item: OntologyChangeItem) => void;
  readonly empty?: ReactNode;
  readonly nextPage?: ReactNode;
}

function itemIdentifier(item: OntologyChangeItem): string {
  return item.kind === "metadata_bag" ? item.bag.id : item.record.key;
}

function itemTitle(item: OntologyChangeItem): string {
  if (item.kind === "metadata_bag") {
    return item.bag.source === undefined || item.bag.source === ""
      ? item.bag.id
      : item.bag.source;
  }
  return item.record.displayTitle;
}

function itemTime(item: OntologyChangeItem): string | undefined {
  return item.kind === "metadata_bag"
    ? item.bag.updatedAt
    : item.record.timestamps?.updatedAt;
}

/** A bounded current-state change list. It does not represent a durable history. */
export function ChangeTimeline({
  className,
  description,
  empty,
  items,
  nextPage,
  onSelect,
  title,
  ...props
}: ChangeTimelineProps) {
  assertBoundedItems("Current changes", items, ONTOLOGY_PAGE_LIMIT);
  assertUniqueIdentifiers(
    "Current change identifier",
    items.map((item) => `${item.kind}:${itemIdentifier(item)}`),
  );
  for (const item of items) {
    assertIdentifier("Current change identifier", itemIdentifier(item));
    assertTextMaximum("Current change identifier", itemIdentifier(item), 200);
    assertIdentifier("Current change title", itemTitle(item));
    assertTextMaximum("Current change title", itemTitle(item), 1_000);
    if (item.kind === "metadata_bag") {
      validateOntologyMetadataBag(item.bag);
    } else {
      validateOntologyRecordSummary(item.record, item.kind);
    }
  }
  const titleId = useId();
  const descriptionId = useId();
  return (
    <section
      {...props}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={["od-change-timeline", className].filter(Boolean).join(" ")}
    >
      <header className="od-change-timeline-heading">
        <h2 id={titleId}>{title}</h2>
        {description ? <p id={descriptionId}>{description}</p> : null}
      </header>
      {items.length === 0 ? (
        <output className="od-change-timeline-empty">{empty}</output>
      ) : (
        <ol
          aria-label="Current changed records"
          className="od-change-timeline-list"
        >
          {items.map((item) => {
            const identifier = itemIdentifier(item);
            const time = itemTime(item);
            const content = (
              <>
                <span className="od-change-timeline-mark" />
                <span className="od-change-timeline-copy">
                  <span className="od-change-timeline-kind">
                    {item.kind === "metadata_bag" ? "Metadata bag" : item.kind}
                  </span>
                  <strong>{itemTitle(item)}</strong>
                  <code>{identifier}</code>
                  {item.kind === "metadata_bag" ? null : (
                    <OntologyLabelList labels={item.record.labels} />
                  )}
                </span>
                {time ? <time dateTime={time}>{time}</time> : null}
              </>
            );
            return (
              <li key={`${item.kind}:${identifier}`}>
                {onSelect ? (
                  <button
                    aria-label={`Open ${itemTitle(item)}`}
                    onClick={() => {
                      onSelect(item);
                    }}
                    type="button"
                  >
                    {content}
                  </button>
                ) : (
                  <article>{content}</article>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {nextPage ? (
        <footer className="od-change-timeline-pagination">{nextPage}</footer>
      ) : null}
    </section>
  );
}
