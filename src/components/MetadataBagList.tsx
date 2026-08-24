import { useId, type HTMLAttributes, type ReactNode } from "react";

import {
  ONTOLOGY_PAGE_LIMIT,
  assertBoundedItems,
  assertUniqueIdentifiers,
  validateOntologyMetadataBag,
  type OntologyMetadataBag,
} from "../OntologyExplorerContract.js";

export interface MetadataBagListProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect" | "title"
> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly bags: readonly OntologyMetadataBag[];
  readonly selectedId?: string;
  readonly onSelect?: (bag: OntologyMetadataBag) => void;
  readonly empty?: ReactNode;
  readonly nextPage?: ReactNode;
}

function bagContext(bag: OntologyMetadataBag): readonly [string, string][] {
  const items: [string, string][] = [];
  if (bag.source) items.push(["Source", bag.source]);
  if (bag.at) items.push(["At", bag.at]);
  if (bag.from) items.push(["From", bag.from]);
  if (bag.to) items.push(["To", bag.to]);
  if (bag.location) {
    items.push([
      "Location",
      `${String(bag.location.latitude)}, ${String(bag.location.longitude)}`,
    ]);
  }
  return items;
}

/** A bounded list for shared current metadata contexts. */
export function MetadataBagList({
  bags,
  className,
  description,
  empty,
  nextPage,
  onSelect,
  selectedId,
  title,
  ...props
}: MetadataBagListProps) {
  assertBoundedItems("Metadata bags", bags, ONTOLOGY_PAGE_LIMIT);
  assertUniqueIdentifiers(
    "Metadata bag identifier",
    bags.map((bag) => bag.id),
  );
  for (const bag of bags) {
    validateOntologyMetadataBag(bag);
  }
  const titleId = useId();
  const descriptionId = useId();
  return (
    <section
      {...props}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={["od-metadata-bags", className].filter(Boolean).join(" ")}
    >
      <header className="od-metadata-bags-heading">
        <h2 id={titleId}>{title}</h2>
        {description ? <p id={descriptionId}>{description}</p> : null}
      </header>
      {bags.length === 0 ? (
        <output className="od-metadata-bags-empty">{empty}</output>
      ) : (
        <ul className="od-metadata-bag-list">
          {bags.map((bag) => {
            const context = bagContext(bag);
            const content = (
              <>
                <span className="od-metadata-bag-title">
                  <strong>
                    {bag.source === undefined || bag.source === ""
                      ? bag.id
                      : bag.source}
                  </strong>
                  <code>{bag.id}</code>
                </span>
                <dl>
                  {context.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            );
            return (
              <li data-selected={selectedId === bag.id} key={bag.id}>
                {onSelect ? (
                  <button
                    aria-label={`Open metadata bag ${bag.source === undefined || bag.source === "" ? bag.id : bag.source}`}
                    aria-pressed={selectedId === bag.id}
                    onClick={() => {
                      onSelect(bag);
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
        </ul>
      )}
      {nextPage ? (
        <footer className="od-metadata-bags-pagination">{nextPage}</footer>
      ) : null}
    </section>
  );
}
